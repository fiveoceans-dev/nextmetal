//
//  Shell.swift
//  NextMetalApp
//

import Foundation

// MARK: – Error type for non-zero exits
enum ShellError: LocalizedError {
    case nonZeroExit(String)
    var errorDescription: String? {
        switch self { case .nonZeroExit(let out): out }
    }
}

// MARK: – Synchronous wrapper
@discardableResult
func run(_ cmd: String,
         env extra: [String:String] = [:]) throws -> String {

    let task = Process()
    task.executableURL = URL(fileURLWithPath: "/bin/zsh")
    task.arguments     = ["-c", cmd]
    task.environment   = ProcessInfo.processInfo.environment
        .merging(extra) { _, new in new }

    let pipe = Pipe()
    task.standardOutput = pipe
    task.standardError  = pipe
    try task.run()

    let data = pipe.fileHandleForReading.readDataToEndOfFile()
    task.waitUntilExit()

    guard task.terminationStatus == 0 else {
        throw ShellError.nonZeroExit(
            String(decoding: data, as: UTF8.self)
                .trimmingCharacters(in: .whitespacesAndNewlines)
        )
    }
    return String(decoding: data, as: UTF8.self)
        .trimmingCharacters(in: .whitespacesAndNewlines)
}

// MARK: – Async/await wrapper
func runAsync(_ cmd: String,
              env extra: [String:String] = [:]) async throws -> String {
    try await withCheckedThrowingContinuation { cont in
        do   { cont.resume(returning: try run(cmd, env: extra)) }
        catch { cont.resume(throwing: error) }
    }
}
