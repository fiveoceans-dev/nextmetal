import Foundation

enum ShellError: LocalizedError {
    case nonZeroExit(String)
    var errorDescription: String? { switch self { case .nonZeroExit(let o): o } }
}

@discardableResult
func shRun(_ cmd: String,
           env extra: [String:String] = [:]) throws -> String {

    let task = Process()
    task.executableURL = URL(fileURLWithPath: "/bin/zsh")
    task.arguments     = ["-c", cmd]
    task.environment   = ProcessInfo.processInfo.environment.merging(extra) { _, n in n }

    let pipe = Pipe()
    task.standardOutput = pipe
    task.standardError  = pipe
    try task.run()

    let data = pipe.fileHandleForReading.readDataToEndOfFile()
    task.waitUntilExit()

    if task.terminationStatus != 0 {
        throw ShellError.nonZeroExit(
            String(decoding: data, as: UTF8.self)
        )
    }
    return String(decoding: data, as: UTF8.self)
}

func runAsync(_ cmd: String,
              env extra: [String:String] = [:]) async throws -> String {
    try await withCheckedThrowingContinuation { cont in
        do   { cont.resume(returning: try shRun(cmd, env: extra)) }
        catch { cont.resume(throwing: error) }
    }
}
