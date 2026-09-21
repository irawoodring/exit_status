import "./style.css";
import { createButtonPanel } from "./ButtonPanel.js";
import { openLoadOverlay } from "./LoadOverlay.js";
import { createLoadingOverlay } from "./LoadingOverlay.js";

let emulator;
let loading;
const base = import.meta.env.BASE_URL;

await loadScript(`${base}v86/libv86.js`);

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

function startVM() {
    loading = createLoadingOverlay(document.getElementById("screen_wrap"))
    emulator = new V86({
        wasm_path: `${base}v86/v86.wasm`,
        memory_size: 256 * 1024 * 1024,
        vga_memory_size: 8 * 1024 * 1024,
        screen_container: document.getElementById("screen_container"),
        bios: { url: `${base}v86/seabios.bin` },
        vga_bios: { url: `${base}v86/vgabios.bin` },
        filesystem: {
            baseurl: `${base}alpine/rootfs-flat/`,
            basefs: `${base}alpine/base-fs.json`,
        },
        bzimage_initrd_from_filesystem: true,
        cmdline:
        "rw root=host9p rootfstype=9p rootflags=trans=virtio,cache=loose modules=virtio_pci tsc=reliable",
        // add back once the VM boots cleanly, using a real relay URL:
        // net_device: { type: "virtio", relay_url: "wisps://wisp.mercurywork.shop" },
        autostart: true,
    });
    emulator.add_listener("download-progress", (e) => loading.progress(e));
    emulator.add_listener("download-error", (e) => loading.fail(e));
    emulator.add_listener("emulator-ready", () => loading.hide());
}

async function restartVM() {
    await emulator.destroy();
    startVM();
}

async function saveState() {
    const new_state = await emulator.save_state();
    var a = document.createElement("a");
    a.download = "v86state.bin";
    a.href = window.URL.createObjectURL(new Blob([new_state]));
    a.dataset.downloadurl = "application/octet-stream:" + a.download + ":" + a.href;
    a.click();

    this.blur();
}

async function loadState(file) {
    const buf = await file.arrayBuffer();
    await emulator.restore_state(buf);
}

const UPLOAD_DIR = "home/user"; // no leading slash; use your real user's home

function downloadBlob(name, data) {
    const url = URL.createObjectURL(new Blob([data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
}

// reuse this in saveState() too: downloadBlob("v86-state.bin", state)

const uploadInput = document.createElement("input");
uploadInput.type = "file";
uploadInput.multiple = true;
uploadInput.addEventListener("change", async () => {
    for (const file of uploadInput.files) {
        const data = new Uint8Array(await file.arrayBuffer());
        await emulator.create_file(`${UPLOAD_DIR}/${file.name}`, data);
    }
    uploadInput.value = ""; // allow re-uploading the same file
});

function uploadFiles() {
    uploadInput.click();
}

async function downloadFile() {
  const path = prompt("Path of file in the VM (e.g. home/revan/out.txt):");
  if (!path) return;
  try {
    const data = await emulator.read_file(path.replace(/^\/+/, ""));
    downloadBlob(path.split("/").pop(), data);
  } catch (err) {
    alert(`Couldn't read ${path}: ${err.message ?? err}`);
  }
}

const wrap = document.getElementById("screen_wrap");
wrap.addEventListener("dragover", (e) => e.preventDefault());
wrap.addEventListener("drop", async (e) => {
  e.preventDefault();
  for (const file of e.dataTransfer.files) {
    await emulator.create_file(`${UPLOAD_DIR}/${file.name}`, new Uint8Array(await file.arrayBuffer()));
  }
});

const { element } = createButtonPanel([
    { id: "restart", label: "Restart", variant: "primary", onClick: restartVM },
    { id: "stop", label: "Stop", variant: "danger", onClick: () => emulator.stop() },
    { id: "run", label: "Run", onClick: () => emulator.run() },
    { id: "fullscreen", label: "Fullscreen", onClick: () => emulator.screen_go_fullscreen() },
    { id: "save", label: "Save state", wide: true, onClick: saveState },
    { id: "load", label: "Load state", wide: true, onClick: () => openLoadOverlay(loadState) },
    { id: "upload", label: "Upload", onClick: uploadFiles },
    { id: "download", label: "Download", onClick: downloadFile },
]);

document.querySelector("#buttons").append(element);
startVM();
