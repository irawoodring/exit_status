import "./style.css";
import { createButtonPanel } from "./ButtonPanel.js";
import { openLoadOverlay } from "./LoadOverlay.js";
import { createLoadingOverlay } from "./LoadingOverlay.js";

const base = import.meta.env.BASE_URL;
let loading;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

await loadScript(`${base}v86/libv86.js`);

let emulator;

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

const { element } = createButtonPanel([
    { id: "restart", label: "Restart", variant: "primary", onClick: restartVM },
    { id: "stop", label: "Stop", variant: "danger", onClick: () => emulator.stop() },
    { id: "run", label: "Run", onClick: () => emulator.run() },
    { id: "fullscreen", label: "Fullscreen", onClick: () => emulator.screen_go_fullscreen() },
    { id: "save", label: "Save state", wide: true, onClick: saveState },
    { id: "load", label: "Load state", wide: true, onClick: () => openLoadOverlay(loadState) },
]);

document.querySelector("#button_panel").append(element);
startVM();
