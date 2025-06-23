
// MARK: - File: DockerView.swift

import SwiftUI

struct DockerView: View {
    @StateObject private var vm = DockerViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {

                // Version section
                Group {
                    Text("Docker Version")
                        .font(.headline)
                    Text(vm.version)
                        .font(.system(.body, design: .monospaced))
                }

                Divider()

                // Images list
                Group {
                    Text("Images")
                        .font(.headline)
                    ForEach(vm.images) { image in
                        HStack {
                            Text("\(image.repository):\(image.tag)")
                            Spacer()
                            Text(image.size)
                                .foregroundStyle(.secondary)
                        }
                        .font(.system(.body, design: .monospaced))
                    }
                }

                Divider()

                // Containers list with actions
                Group {
                    Text("Containers")
                        .font(.headline)
                    ForEach(vm.containers) { ctr in
                        VStack(alignment: .leading) {
                            HStack {
                                Text(ctr.names)
                                    .bold()
                                Spacer()
                                Text(ctr.state)
                                    .foregroundStyle(ctr.state == "running" ? .green : .red)
                            }
                            .font(.system(.body, design: .monospaced))

                            HStack {
                                Text("Image: \(ctr.image)")
                                Spacer()
                                Button(ctr.state == "running" ? "Stop" : "Start") {
                                    Task { await ctr.state == "running" ? vm.stop(ctr) : vm.start(ctr) }
                                }
                                .buttonStyle(.borderedProminent)
                            }
                            .font(.caption)
                        }
                        .padding(.vertical, 4)
                    }
                }

                // Error message
                if let err = vm.error {
                    Text(err)
                        .foregroundStyle(.red)
                        .padding(.top)
                }
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .task { await vm.refreshAll() }
        .refreshable { await vm.refreshAll() }
    }
}

#Preview {
    DockerView()
}
