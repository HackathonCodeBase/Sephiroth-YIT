from huggingface_hub import HfApi
api = HfApi()
try:
    repos = [r.id for r in api.list_models(author="DurgeshAP")]
    for r in repos:
        try:
            files = api.list_repo_tree(r)
            h5_files = [(f.rfilename, f.size) for f in files if f.rfilename.endswith(".h5")]
            print(f"{r}: {h5_files}")
        except Exception as e:
            print(f"Error in {r}: {e}")
except Exception as e:
    print(f"Global error: {e}")
