"""
Build script for ThanhVinhStudio desktop application.
Usage: python build.py
"""

import subprocess
import sys
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent


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
    print("\n[1/4] Building frontend...")
    run([sys.executable, "-m", "npm", "run", "build"], cwd=frontend_dir)

    out_dir = frontend_dir / "out"
    if not out_dir.exists():
        print(f"ERROR: Frontend build output not found at {out_dir}")
        sys.exit(1)
    print(f"Frontend built: {out_dir}")


def install_pyinstaller():
    """Ensure PyInstaller is installed."""
    print("\n[2/4] Checking PyInstaller...")
    try:
        import PyInstaller  # noqa: F401
        print("PyInstaller already installed.")
    except ImportError:
        print("Installing PyInstaller...")
        run([sys.executable, "-m", "pip", "install", "pyinstaller"])


def build_app():
    """Run PyInstaller with the spec file."""
    print("\n[3/4] Building application with PyInstaller...")
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


def create_installer():
    """Create NSIS installer on Windows."""
    if sys.platform != "win32":
        print("\n[4/4] Skipping NSIS (not on Windows).")
        return

    print("\n[4/4] Creating NSIS installer...")
    nsis_script = ROOT / "installer.nsi"
    if not nsis_script.exists():
        print(f"WARNING: NSIS script not found: {nsis_script}")
        return

    # Try to find makensis
    makensis = shutil.which("makensis")
    if not makensis:
        # Common install locations
        for path in [
            r"C:\Program Files (x86)\NSIS\makensis.exe",
            r"C:\Program Files\NSIS\makensis.exe",
        ]:
            if Path(path).exists():
                makensis = path
                break

    if not makensis:
        print("WARNING: makensis not found. Install NSIS to create the installer.")
        print("  Download: https://nsis.sourceforge.io/Download")
        return

    run([makensis, str(nsis_script)])

    installer = ROOT / "dist" / "ThanhVinhStudio-Setup.exe"
    if installer.exists():
        size_mb = installer.stat().st_size / (1024 * 1024)
        print(f"Installer created: {installer} ({size_mb:.0f} MB)")


def main():
    print("ThanhVinhStudio Build Script")
    print(f"Platform: {sys.platform}")
    print(f"Python: {sys.version}")
    print(f"Root: {ROOT}")

    build_frontend()
    install_pyinstaller()
    build_app()
    create_installer()

    print("\n" + "=" * 60)
    print("BUILD COMPLETE!")
    print("=" * 60)
    dist = ROOT / "dist" / "ThanhVinhStudio"
    print(f"Application: {dist}")
    if sys.platform == "win32":
        print(f"Installer:   {dist.parent / 'ThanhVinhStudio-Setup.exe'}")


if __name__ == "__main__":
    main()
