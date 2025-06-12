//
//  App.swift
//  NextMetal
//
import SwiftUI
import Vapor
import NIOCore

// ─────────── Custom Environment Key ───────────
private struct VaporAppKey: EnvironmentKey {
  static let defaultValue: Application? = nil
}

extension EnvironmentValues {
  var vaporApplication: Application? {
    get { self[VaporAppKey.self] }
    set { self[VaporAppKey.self] = newValue }
  }
}

// ─────────── Main Entry Point ───────────
@main
struct NextMetalApp: App {
  @State private var application: Application?
  @State private var vaporBooted  = false
  @StateObject private var authVM = AuthViewModel()

  var body: some Scene {
    WindowGroup {
      if !vaporBooted {
        ProgressView("Starting Vapor…")
          .task { await bootVapor() }
      } else if let app = application, authVM.user != nil {
        MainInterface()
          .environment(\.vaporApplication, app)
          .environmentObject(authVM)
      } else if let app = application {
        LoginView(vm: authVM)
          .environment(\.vaporApplication, app)
          .environmentObject(authVM)
      } else {
        ProgressView("Starting Vapor…")
          .task { await bootVapor() }
      }
    }
  }

  @MainActor
  private func bootVapor() async {
    guard !vaporBooted else { return }
    vaporBooted = true
    do {
      let env  = try Environment.detect()
      let elg  = MultiThreadedEventLoopGroup(numberOfThreads: System.coreCount)
      let app  = try await Application.make(env, .shared(elg))
      application = app
      authVM.inject(app)
    } catch {
      fatalError("Vapor failed to start: \(error)")
    }
  }
}



