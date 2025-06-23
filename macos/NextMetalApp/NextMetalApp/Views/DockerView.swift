import SwiftUI

struct DockerView: View {
    @StateObject private var vm = DockerVM()   // DockerVM conforms to ObservableObject

    var body: some View {
        VStack {
            HStack {
                Button("Refresh") { vm.start() }
                Spacer()
                Text(vm.versionText)
                    .font(.footnote)
                    .monospaced()
            }
            .padding(.bottom, 8)

            if let err = vm.errorMessage {
                Text(err)
                    .foregroundStyle(.red)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            Table(vm.containers) {
                TableColumn("ID",    value: \.id).width(min: 80, ideal: 120)
                TableColumn("Image", value: \.image)
                TableColumn("Status",value: \.status)
                TableColumn("Ports", value: \.ports)
                TableColumn("Name",  value: \.name)
            }
        }
        .padding()
        .onAppear { vm.start() }
        .onDisappear { vm.stop() }
    }
}
