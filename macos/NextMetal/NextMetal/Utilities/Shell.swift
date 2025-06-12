//
//  Shell.swift
//  NextMetal
//

import Foundation

@discardableResult
func runShell(_ command: String) -> String {
    let task = Process()
    let pipe = Pipe()
    
    task.standardOutput = pipe
    task.standardError = pipe
    task.standardInput = nil
    task.launchPath = "/bin/zsh"
    task.arguments = ["-c", command]
    
    do {
        try task.run()
    } catch {
        return "Failed to launch process: \(error.localizedDescription)"
    }
    
    let data = pipe.fileHandleForReading.readDataToEndOfFile()
    task.waitUntilExit()
    
    guard let output = String(data: data, encoding: .utf8) else {
        return "Failed to decode output"
    }
    
    return output.trimmingCharacters(in: .whitespacesAndNewlines)
}
