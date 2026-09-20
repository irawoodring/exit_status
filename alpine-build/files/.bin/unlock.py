#!/usr/bin/env python3


import subprocess
import tarfile
import os
import sys

def decrypt_folder(gpg_path, extract_to_dir, password):
    if not os.path.exists(gpg_path):
        print(f"Error: Encrypted file '{gpg_path}' does not exist.")
        return

    tar_path = "temp_decrypted.tar.gz"

    try:
        # Step 1: Decrypt the GPG file back into a tarball
        print(f"Decrypting '{gpg_path}'...")
        gpg_command = [
            "gpg", "--batch", "--decrypt",
            "--passphrase", password,
            "--output", tar_path,
            gpg_path
        ]

        subprocess.run(gpg_command, check=True)

        # Step 2: Extract the tarball
        print(f"Extracting archive to '{extract_to_dir}'...")
        with tarfile.open(tar_path, "r:gz") as tar:
            tar.extractall(path=extract_to_dir, filter="fully_trusted")
        print("Decryption and extraction successful!")

    except subprocess.CalledProcessError as e:
        print(f"GPG Decryption failed (check your password): {e}")
    except Exception as e:
        print(f"An error occurred during extraction: {e}")
    finally:
        # Clean up the temporary decrypted tar file
        if os.path.exists(tar_path):
            os.remove(tar_path)

# Example Usage
if __name__ == "__main__":
    GPG_FILE = sys.argv[1]
    TARGET_DIR = sys.argv[2]
    SECRET = sys.argv[3]

    decrypt_folder(GPG_FILE, TARGET_DIR, SECRET)

