# scripts/sync_to_clickup.py
import os
import json
import urllib.request
import urllib.error

def make_request(url, headers, method="GET", body=None):
    data = None
    if body:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, headers=headers, method=method, data=data)
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.reason}")
        try:
            print("Response:", e.read().decode("utf-8"))
        except:
            pass
        raise e

def read_doc_file(filename):
    filepath = os.path.join("docs", "clickup", filename)
    if not os.path.exists(filepath):
        print(f"Warning: File {filepath} not found.")
        return ""
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()

def create_completed_task(list_id, headers, task_name):
    body = {"name": task_name}
    # ClickUp status schemas are case-sensitive and list-specific. We try common complete/done aliases.
    for status in ["complete", "Closed", "done", "Done", "closed", "complete"]:
        try:
            body["status"] = status
            make_request(f"https://api.clickup.com/api/v2/list/{list_id}/task", headers, "POST", body)
            return
        except urllib.error.HTTPError as e:
            if e.code == 400:
                continue # Try the next status alias
            raise e
    
    # Absolute fallback: create task without specifying status, meaning it will remain Open
    try:
        body.pop("status", None)
        make_request(f"https://api.clickup.com/api/v2/list/{list_id}/task", headers, "POST", body)
    except Exception as e:
        print(f"  x Failed to create task '{task_name}': {e}")

def main():
    print("=========================================")
    print("     AI-Letter ClickUp Workspace Sync     ")
    print("=========================================")
    
    token = input("Enter your ClickUp Personal API Token (pk_...): ").strip()
    if not token:
        print("API Token is required.")
        return
        
    team_id = input("Enter your ClickUp Workspace (Team) ID (e.g. 90123456): ").strip()
    if not team_id:
        print("Team ID is required.")
        return

    headers = {
        "Authorization": token
    }

    # 1. Verify workspace access
    print("\n[1/7] Verifying workspace access...")
    try:
        teams = make_request("https://api.clickup.com/api/v2/team", headers)
        valid_teams = [t["id"] for t in teams.get("teams", [])]
        if team_id not in valid_teams:
            print(f"Warning: Team ID {team_id} was not found in your authorized teams: {valid_teams}")
            proceed = input("Do you want to proceed anyway? (y/n): ").strip().lower()
            if proceed != 'y':
                return
    except Exception as e:
        print("Failed to authorize ClickUp API token or fetch teams:", e)
        return

    # 2. Create or locate Space "AI-Letter Workspace"
    print("\n[2/7] Creating or locating ClickUp Space 'AI-Letter Workspace'...")
    space_id = None
    try:
        existing_spaces = make_request(f"https://api.clickup.com/api/v2/team/{team_id}/space?archived=false", headers)
        for sp in existing_spaces.get("spaces", []):
            if sp["name"] == "AI-Letter Workspace":
                space_id = sp["id"]
                print(f"--> Located existing Space! ID: {space_id}")
                break
    except Exception as e:
        print("Warning: Could not fetch existing spaces, attempting space creation:", e)

    if not space_id:
        space_body = {
            "name": "AI-Letter Workspace",
            "multiple_assignees": True,
            "features": {
                "due_dates": {"enabled": True, "start_date": True, "remap_due_dates": True, "remap_closed_due_date": False},
                "time_tracking": {"enabled": False},
                "tags": {"enabled": True},
                "custom_fields": {"enabled": True}
            }
        }
        try:
            space = make_request(f"https://api.clickup.com/api/v2/team/{team_id}/space", headers, "POST", space_body)
            space_id = space["id"]
            print(f"--> Space created successfully! ID: {space_id}")
        except Exception as e:
            print("Failed to create ClickUp Space. Please make sure your Workspace ID and Token are correct.", e)
            return

    # 3. Create or locate Folder: "Product & PM Docs"
    print("\n[3/7] Locating or creating Folder 'Product & PM Docs'...")
    folder_pm_id = None
    try:
        existing_folders = make_request(f"https://api.clickup.com/api/v2/space/{space_id}/folder?archived=false", headers)
        for fd in existing_folders.get("folders", []):
            if fd["name"] == "Product & PM Docs":
                folder_pm_id = fd["id"]
                print(f"--> Located existing Folder! ID: {folder_pm_id}")
                break
    except Exception as e:
        print("Warning: Could not fetch existing folders:", e)

    if not folder_pm_id:
        folder_pm = make_request(f"https://api.clickup.com/api/v2/space/{space_id}/folder", headers, "POST", {"name": "Product & PM Docs"})
        folder_pm_id = folder_pm["id"]
        print(f"--> Folder created! ID: {folder_pm_id}")

    # 4. Create or locate lists under Folder "Product & PM Docs"
    print("\n[4/7] Locating or creating Lists and uploading Documentation...")
    list_specs_id = None
    list_roadmap_id = None
    try:
        existing_lists = make_request(f"https://api.clickup.com/api/v2/folder/{folder_pm_id}/list", headers)
        for lst in existing_lists.get("lists", []):
            if lst["name"] == "Product Specs & Architecture":
                list_specs_id = lst["id"]
            elif lst["name"] == "Roadmap & Release Logs":
                list_roadmap_id = lst["id"]
    except Exception as e:
        print("Warning: Could not fetch existing lists under PM folder:", e)

    if not list_specs_id:
        list_specs = make_request(f"https://api.clickup.com/api/v2/folder/{folder_pm_id}/list", headers, "POST", {"name": "Product Specs & Architecture"})
        list_specs_id = list_specs["id"]
    if not list_roadmap_id:
        list_roadmap = make_request(f"https://api.clickup.com/api/v2/folder/{folder_pm_id}/list", headers, "POST", {"name": "Roadmap & Release Logs"})
        list_roadmap_id = list_roadmap["id"]

    # Check existing tasks in specs list to avoid duplicate uploads
    existing_specs_tasks = []
    try:
        tasks_res = make_request(f"https://api.clickup.com/api/v2/list/{list_specs_id}/task?archived=false", headers)
        existing_specs_tasks = [t["name"] for t in tasks_res.get("tasks", [])]
    except Exception as e:
        print("Warning: Could not fetch tasks in specs list:", e)

    specs_docs = [
        {"name": "Product Overview & Brand Positioning", "file": "product_overview.md"},
        {"name": "Technical Architecture & Data Flows", "file": "technical_architecture.md"},
        {"name": "AI Engine & Multimodal CV Parser Spec", "file": "ai_engine_spec.md"},
        {"name": "PDF Rendering & Export Spec", "file": "pdf_export_spec.md"}
    ]
    for doc in specs_docs:
        if doc["name"] in existing_specs_tasks:
            print(f"  o Spec '{doc['name']}' already exists. Skipping upload.")
            continue
        desc = read_doc_file(doc["file"])
        task_body = {
            "name": doc["name"],
            "description": desc,
            "priority": 2 # Medium
        }
        make_request(f"https://api.clickup.com/api/v2/list/{list_specs_id}/task", headers, "POST", task_body)
        print(f"  + Uploaded spec: {doc['name']}")

    # Check existing tasks in roadmap list
    existing_roadmap_tasks = []
    try:
        tasks_res = make_request(f"https://api.clickup.com/api/v2/list/{list_roadmap_id}/task?archived=false", headers)
        existing_roadmap_tasks = [t["name"] for t in tasks_res.get("tasks", [])]
    except Exception as e:
        print("Warning: Could not fetch tasks in roadmap list:", e)

    roadmap_docs = [
        {"name": "Version 1.0.0 Release Logs", "file": "release_logs.md"},
        {"name": "Future Roadmap & Next Steps", "file": "roadmap.md"}
    ]
    for doc in roadmap_docs:
        if doc["name"] in existing_roadmap_tasks:
            print(f"  o Roadmap doc '{doc['name']}' already exists. Skipping upload.")
            continue
        desc = read_doc_file(doc["file"])
        task_body = {
            "name": doc["name"],
            "description": desc,
            "priority": 3 # High
        }
        make_request(f"https://api.clickup.com/api/v2/list/{list_roadmap_id}/task", headers, "POST", task_body)
        print(f"  + Uploaded roadmap doc: {doc['name']}")

    # 5. Create or locate Folder: "Completed Tasks"
    print("\n[5/7] Locating or creating Folder 'Completed Tasks'...")
    folder_done_id = None
    try:
        existing_folders = make_request(f"https://api.clickup.com/api/v2/space/{space_id}/folder?archived=false", headers)
        for fd in existing_folders.get("folders", []):
            if fd["name"] == "Completed Tasks":
                folder_done_id = fd["id"]
                print(f"--> Located existing Folder! ID: {folder_done_id}")
                break
    except Exception as e:
        print("Warning: Could not fetch existing folders:", e)

    if not folder_done_id:
        folder_done = make_request(f"https://api.clickup.com/api/v2/space/{space_id}/folder", headers, "POST", {"name": "Completed Tasks"})
        folder_done_id = folder_done["id"]
        print(f"--> Folder created! ID: {folder_done_id}")

    # 6. Create or locate Lists under Folder "Completed Tasks"
    print("\n[6/7] Locating or creating Lists for Completed Tasks...")
    list_features_id = None
    list_seo_id = None
    list_refactor_id = None
    try:
        existing_lists = make_request(f"https://api.clickup.com/api/v2/folder/{folder_done_id}/list", headers)
        for lst in existing_lists.get("lists", []):
            if lst["name"] == "Core Features (Done)":
                list_features_id = lst["id"]
            elif lst["name"] == "SEO & Marketing (Done)":
                list_seo_id = lst["id"]
            elif lst["name"] == "Refactoring & Bugs (Done)":
                list_refactor_id = lst["id"]
    except Exception as e:
        print("Warning: Could not fetch existing lists under done folder:", e)

    if not list_features_id:
        list_features = make_request(f"https://api.clickup.com/api/v2/folder/{folder_done_id}/list", headers, "POST", {"name": "Core Features (Done)"})
        list_features_id = list_features["id"]
    if not list_seo_id:
        list_seo = make_request(f"https://api.clickup.com/api/v2/folder/{folder_done_id}/list", headers, "POST", {"name": "SEO & Marketing (Done)"})
        list_seo_id = list_seo["id"]
    if not list_refactor_id:
        list_refactor = make_request(f"https://api.clickup.com/api/v2/folder/{folder_done_id}/list", headers, "POST", {"name": "Refactoring & Bugs (Done)"})
        list_refactor_id = list_refactor["id"]

    # 7. Create completed tasks
    print("\n[7/7] Populating completed tasks and marking them as Complete...")
    
    # Check existing tasks in features list
    existing_features_tasks = []
    try:
        tasks_res = make_request(f"https://api.clickup.com/api/v2/list/{list_features_id}/task?archived=false", headers)
        existing_features_tasks = [t["name"] for t in tasks_res.get("tasks", [])]
    except Exception as e:
        print("Warning: Could not fetch tasks in features list:", e)

    # Core Features completed
    done_features = [
        "Interactive CV Maker Tab & Editor",
        "Speech Recognition / Voice Dictation for Profile & Dashboard",
        "Multiple Resumes & Switcher Bar",
        "Referral Rewards Program & Share Buttons",
        "Stripe Monthly/Yearly checkout & billing portal",
        "ATS Score Reviewer & Side-by-side keyword matches panel",
        "Dual Column Template Layout vertical reordering math",
        "10-Section Template rendering support (Awards, Courses, Publications, Interests)"
    ]
    for task_name in done_features:
        if task_name in existing_features_tasks:
            print(f"  o Core Feature '{task_name}' already logged. Skipping.")
            continue
        create_completed_task(list_features_id, headers, task_name)
        print(f"  + Logged Core Feature: {task_name}")

    # Check existing tasks in SEO list
    existing_seo_tasks = []
    try:
        tasks_res = make_request(f"https://api.clickup.com/api/v2/list/{list_seo_id}/task?archived=false", headers)
        existing_seo_tasks = [t["name"] for t in tasks_res.get("tasks", [])]
    except Exception as e:
        print("Warning: Could not fetch tasks in SEO list:", e)

    # SEO completed
    done_seo = [
        "Landing page marketing copy optimizations",
        "Long-tail SEO landing pages (/cover-letter-ai-developer, /linkedin-cold-message-templates, /freelancer-self-introduction)",
        "Link sitemap.xml and robots meta index parameters",
        "Add subpages to Landing.jsx footer to resolve orphan pages issue"
    ]
    for task_name in done_seo:
        if task_name in existing_seo_tasks:
            print(f"  o SEO Task '{task_name}' already logged. Skipping.")
            continue
        create_completed_task(list_seo_id, headers, task_name)
        print(f"  + Logged SEO Task: {task_name}")

    # Check existing tasks in refactor list
    existing_refactor_tasks = []
    try:
        tasks_res = make_request(f"https://api.clickup.com/api/v2/list/{list_refactor_id}/task?archived=false", headers)
        existing_refactor_tasks = [t["name"] for t in tasks_res.get("tasks", [])]
    except Exception as e:
        print("Warning: Could not fetch tasks in refactor list:", e)

    # Refactorings & Bugs completed
    done_refactor = [
        "iOS Safari 14+ older device compatibility compilation target",
        "html2canvas-pro global override to support oklch Tailwind v4 color rendering",
        "Fix PDF export margins scaling & page offset alignment",
        "Fix ReferenceError in CVMakerTab parameters",
        "Fix Temporal Dead Zone hook declaration order in Dashboard",
        "Localize Section Order controls and template headers dynamically (UK, EN, DE, IT)"
    ]
    for task_name in done_refactor:
        if task_name in existing_refactor_tasks:
            print(f"  o Bugfix/Refactoring '{task_name}' already logged. Skipping.")
            continue
        create_completed_task(list_refactor_id, headers, task_name)
        print(f"  + Logged Bugfix/Refactoring: {task_name}")

    print("\n=========================================")
    print("SUCCESS: ClickUp Space fully populated!")
    print(f"Check your ClickUp Workspace to see the brand new Space!")
    print("=========================================")

if __name__ == "__main__":
    main()
