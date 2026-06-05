"""
Build script for ThanhVinhStudio desktop application.
Usage: python build.py
"""

import subprocess
import sys
import shutil
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent


def clean_generated_outputs():
    """Remove generated build outputs before packaging."""
    print("\n[0/5] Cleaning generated outputs...")
    targets = [
        ROOT / "build",
        ROOT / "dist",
        ROOT / "frontend" / "out",
        ROOT / "frontend" / ".next",
    ]
    for target in targets:
        if target.exists():
            shutil.rmtree(target)
            print(f"Removed: {target}")


def run(cmd: list[str], cwd: Path | None = None, **kwargs):
    """Run a command and exit on failure."""
    print(f"\n{'='*60}")
    print(f"Running: {' '.join(cmd)}")
    print(f"{'='*60}")
    result = subprocess.run(cmd, cwd=cwd or ROOT, **kwargs)
    if result.returncode != 0:
        print(f"FAILED with exit code {result.returncode}")
        sys.exit(result.returncode)


def build_frontend():
    """Build Next.js frontend as static export."""
    frontend_dir = ROOT / "frontend"
    pnpm = shutil.which("pnpm")
    npm = shutil.which("npm")
    if (frontend_dir / "package-lock.json").exists() and npm:
        package_manager = npm
    else:
        package_manager = pnpm or npm
    if not package_manager:
        print("ERROR: npm or pnpm not found. Install Node.js first.")
        sys.exit(1)

    print("\n[1/5] Installing frontend dependencies...")
    node_modules = frontend_dir / "node_modules"
    if not node_modules.exists():
        if (frontend_dir / "package-lock.json").exists() and Path(package_manager).name.startswith("npm"):
            run([package_manager, "ci"], cwd=frontend_dir)
        elif pnpm:
            run([package_manager, "install", "--frozen-lockfile"], cwd=frontend_dir)
        else:
            run([package_manager, "install"], cwd=frontend_dir)
    else:
        print("Frontend dependencies already installed.")

    print("\n[2/5] Building frontend...")
    run([package_manager, "run", "build"], cwd=frontend_dir)

    out_dir = frontend_dir / "out"
    if not out_dir.exists():
        print(f"ERROR: Frontend build output not found at {out_dir}")
        sys.exit(1)
    print(f"Frontend built: {out_dir}")


def install_pyinstaller():
    """Ensure PyInstaller is installed."""
    print("\n[3/5] Checking PyInstaller...")
    try:
        import PyInstaller  # noqa: F401
        print("PyInstaller already installed.")
    except ImportError:
        print("Installing PyInstaller...")
        uv = shutil.which("uv")
        if uv:
            run([uv, "pip", "install", "--python", sys.executable, "pyinstaller"])
        else:
            run([sys.executable, "-m", "ensurepip", "--upgrade"])
            run([sys.executable, "-m", "pip", "install", "pyinstaller"])


def build_app():
    """Run PyInstaller with the spec file."""
    print("\n[4/5] Building application with PyInstaller...")
    spec_file = ROOT / "thanhvinhstudio.spec"
    if not spec_file.exists():
        print(f"ERROR: Spec file not found: {spec_file}")
        sys.exit(1)

    run([
        sys.executable, "-m", "PyInstaller",
        str(spec_file),
        "--clean",
        "--noconfirm",
        "--distpath", str(ROOT / "dist"),
        "--workpath", str(ROOT / "build"),
    ])

    if sys.platform == "darwin":
        app_path = ROOT / "dist" / "ThanhVinhStudio.app"
        if not app_path.exists():
            print(f"ERROR: macOS app output not found at {app_path}")
            sys.exit(1)
        copy_release_scripts(ROOT / "dist", mac_only=True)
        create_macos_zip(app_path)
    else:
        dist_dir = ROOT / "dist" / "ThanhVinhStudio"
        if not dist_dir.exists():
            print(f"ERROR: Build output not found at {dist_dir}")
            sys.exit(1)

        exe_name = "ThanhVinhStudio.exe" if sys.platform == "win32" else "ThanhVinhStudio"
        exe_path = dist_dir / exe_name
        if exe_path.exists():
            size_mb = sum(f.stat().st_size for f in dist_dir.rglob("*") if f.is_file()) / (1024 * 1024)
            print(f"Build successful: {dist_dir} ({size_mb:.0f} MB)")
        else:
            print(f"WARNING: Executable not found at {exe_path}")

        copy_release_scripts(dist_dir, mac_only=False)


def create_macos_zip(app_path: Path):
    """Create a lightweight macOS zip with the app and helper scripts."""
    zip_path = ROOT / "dist" / "ThanhVinhStudio-macOS.zip"
    if zip_path.exists():
        zip_path.unlink()

    items = [
        app_path,
        ROOT / "dist" / "Download Models.command",
        ROOT / "dist" / "Open First Time.command",
    ]

    print(f"\nCreating macOS zip: {zip_path}")
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for item in items:
            if item.is_dir():
                for file in item.rglob("*"):
                    if file.is_file():
                        zf.write(file, file.relative_to(item.parent))
            elif item.exists():
                zf.write(item, item.name)
    print(f"macOS package created: {zip_path}")


def copy_release_scripts(dist_dir: Path, mac_only: bool):
    """Copy first-run/download scripts next to the packaged application."""
    print("\nCopying release helper scripts...")
    if mac_only:
        scripts = ["Download Models.command", "Open First Time.command"]
    else:
        scripts = ["Download Models.bat"]
    for script in scripts:
        src = ROOT / script
        if not src.exists():
            print(f"WARNING: missing helper script: {src}")
            continue
        dest = dist_dir / script
        shutil.copy2(src, dest)
        if dest.suffix == ".command":
            dest.chmod(dest.stat().st_mode | 0o111)
        print(f"Copied: {script}")


def create_installer():
    """Create an Inno Setup installer on Windows."""
    if sys.platform != "win32":
        print("\n[5/5] Skipping Windows installer (not on Windows).")
        return

    print("\n[5/5] Creating Windows installer...")
    inno_script = ROOT / "installer.iss"
    if not inno_script.exists():
        print(f"WARNING: Inno Setup script not found: {inno_script}")
        return

    iscc = shutil.which("ISCC.exe") or shutil.which("ISCC")
    if not iscc:
        for path in [
            Path.home() / "AppData" / "Local" / "Programs" / "Inno Setup 6" / "ISCC.exe",
            Path(r"C:\Program Files (x86)\Inno Setup 6\ISCC.exe"),
            Path(r"C:\Program Files\Inno Setup 6\ISCC.exe"),
        ]:
            if path.exists():
                iscc = str(path)
                break

    if not iscc:
        print("WARNING: ISCC.exe not found. Install Inno Setup 6 to create the installer.")
        print("  Download: https://jrsoftware.org/isinfo.php")
        return

    run([iscc, str(inno_script)])

    installer = ROOT / "dist" / "ThanhVinhStudio-Setup.exe"
    if installer.exists():
        size_mb = installer.stat().st_size / (1024 * 1024)
        print(f"Installer created: {installer} ({size_mb:.0f} MB)")


def main():
    print("ThanhVinhStudio Build Script")
    print(f"Platform: {sys.platform}")
    print(f"Python: {sys.version}")
    print(f"Root: {ROOT}")

    clean_generated_outputs()
    build_frontend()
    install_pyinstaller()
    build_app()
    create_installer()

    print("\n" + "=" * 60)
    print("BUILD COMPLETE!")
    print("=" * 60)
    if sys.platform == "darwin":
        print(f"Application: {ROOT / 'dist' / 'ThanhVinhStudio.app'}")
        print(f"Package:     {ROOT / 'dist' / 'ThanhVinhStudio-macOS.zip'}")
    else:
        dist = ROOT / "dist" / "ThanhVinhStudio"
        print(f"Application: {dist}")
    if sys.platform == "win32":
        print(f"Installer:   {ROOT / 'dist' / 'ThanhVinhStudio-Setup.exe'}")


if __name__ == "__main__":
    main()
