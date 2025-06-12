//
//  DockerViewModel.swift
//  NextMetal
//
import SwiftUI
import Combine

@MainActor
final class DockerViewModel: ObservableObject {

    // GUI-bound properties
    @Published var isInstalled = false
    @Published var version     = ""
    @Published var containers  = ""
    @Published var output      = ""

    // MARK: – Actions
    func checkDocker() {
        isInstalled = DockerService.isInstalled()
        version     = isInstalled ? DockerService.version() : "Unavailable"
        containers  = isInstalled ? DockerService.listContainers() : ""
    }

    func pull(image: String) {
        output = DockerService.pullImage(image: image)
    }

    func run(image: String) {
        output = DockerService.runContainer(image: image)
        containers = DockerService.listContainers()
    }

    func refresh() { containers = DockerService.listContainers() }
}
