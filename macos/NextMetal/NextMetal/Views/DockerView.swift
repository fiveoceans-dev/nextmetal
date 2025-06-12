//
//  DockerView.swift
//  NextMetal
//

import SwiftUI

struct DockerView: View {

    @StateObject private var vm = DockerViewModel()

    @State private var imageToRun  = ""
    @State private var imageToPull = "niip42/nextmetal"

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {

            HStack {
                Button("Check Docker", action: vm.checkDocker)
                Spacer()
                if vm.isInstalled { Text(vm.version) }
            }

            if vm.isInstalled {
                containerSection
                pullRunSection
                outputSection
            } else {
                Text("Docker not found").foregroundColor(.red)
            }

            Spacer()
        }
        .padding(24)
        .onAppear(perform: vm.checkDocker)
    }

    // MARK: – sub-views
    private var containerSection: some View {
        GroupBox("Containers") {
            ScrollView {
                Text(vm.containers)
                    .font(.system(.body, design: .monospaced))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }.frame(height: 150)

            Button("Refresh", action: vm.refresh)
        }
    }

    private var pullRunSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                TextField("Image to pull", text: $imageToPull)
                Button("Pull") { vm.pull(image: imageToPull) }
            }
            HStack {
                TextField("Image to run", text: $imageToRun)
                Button("Run") { vm.run(image: imageToRun) }
            }
        }
    }

    private var outputSection: some View {
        GroupBox("Output") {
            ScrollView {
                Text(vm.output)
                    .font(.system(.body, design: .monospaced))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }.frame(height: 120)
        }
    }
}
