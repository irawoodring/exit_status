#!/usr/bin/env python3


import subprocess
import tarfile
import os
import sys

def encrypt_folder(folder_path, output_gpg_path, password):
    if not os.path.exists(folder_path):
        print(f"Error: Folder '{folder_path}' does not exist.")
        return

    tar_path = "temp_archive.tar.gz"

    try:
        # Step 1: Create a compressed tarball
        print(f"Archiving and compressing '{folder_path}'...")
        with tarfile.open(tar_path, "w:gz") as tar:
            tar.add(folder_path, arcname=os.path.basename(folder_path))

        # Step 2: Encrypt the tarball using GPG
        print(f"Encrypting archive to '{output_gpg_path}'...")
        gpg_command = [
            "gpg", "--batch", "--symmetric",
            "--cipher-algo", "AES256",
            "--passphrase", password,
            "--output", output_gpg_path,
            tar_path
        ]

        # Run GPG command securely
        subprocess.run(gpg_command, check=True)
        print("Encryption successful!")

    except subprocess.CalledProcessError as e:
        print(f"GPG Encryption failed: {e}")
    finally:
        # Clean up the temporary unencrypted tar file
        if os.path.exists(tar_path):
            os.remove(tar_path)

# Example Usage
if __name__ == "__main__":
    FOLDER = sys.argv[1]
    OUTPUT = sys.argv[2]
    SECRET = sys.argv[3]

    encrypt_folder(FOLDER, OUTPUT, SECRET)

