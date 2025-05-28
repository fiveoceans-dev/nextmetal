import Foundation

enum EmbeddedPython {
    private static let version = "3.12"
    private static var didActivate = false

    @discardableResult
    static func run(_ scriptName: String) -> String {
        activateOnce()

        guard let fwPath = Bundle.main.privateFrameworksPath else {
            return "Python.framework not found in app bundle"
        }

        let pythonExec = "\(fwPath)/Python.framework/Versions/\(version)/bin/python3.12"
        guard FileManager.default.isExecutableFile(atPath: pythonExec) else {
            return "Python executable not found at:\n\(pythonExec)"
        }

        guard let scriptURL = Bundle.main.url(forResource: scriptName, withExtension: "py") else {
            return "Could not locate bundled script: \(scriptName).py"
        }

        let process = Process()
        process.launchPath = pythonExec
        process.arguments = [scriptURL.path]

        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = pipe

        do {
            try process.run()
        } catch {
            return "Failed to launch Python:\n\(error.localizedDescription)"
        }

        process.waitUntilExit()
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        let output = String(data: data, encoding: .utf8) ?? "Output decoding failed"

        if process.terminationStatus == 0 {
            return output
        } else {
            return "Python exited with status \(process.terminationStatus):\n\(output)"
        }
    }

    private static func activateOnce() {
        guard !didActivate,
              let fwPath = Bundle.main.privateFrameworksPath,
              let resPath = Bundle.main.resourcePath else { return }

        setenv("PYTHONHOME", "\(fwPath)/Python.framework/Versions/\(version)", 1)
        setenv("PYTHONPATH", "\(resPath)/python/stdlib:\(resPath)/python/site-packages", 1)
        didActivate = true
    }
}
