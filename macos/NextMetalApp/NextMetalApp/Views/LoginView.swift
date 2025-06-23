import SwiftUI

struct LoginView: View {
    @ObservedObject var vm: AuthViewModel            // ← make sure the type’s name matches your VM
    @State private var email: String
    @State private var password = ""

    // MARK: - Initialiser
    init(vm: AuthViewModel) {
        self.vm = vm
        _email  = State(initialValue: vm.cachedEmail)
    }

    // MARK: - UI
    var body: some View {
        VStack(spacing: 24) {

            Text("NEXTMETAL.DESKTOP")
                .font(Orbitron.mono(size: 22, weight: .bold))
                .foregroundColor(.cyberYellow)
                .neon()

            // Credentials
            Group {
                TextField("E-MAIL",    text: $email)
                SecureField("PASSWORD", text: $password)
            }
            .textFieldStyle(.plain)
            .padding(12)
            .background(Color.cyberGrid.opacity(0.25))
            .cornerRadius(4)
            .font(Orbitron.mono(size: 13))

            // Remember toggle ­– use a style that exists on macOS
            Toggle("REMEMBER ME", isOn: $vm.remember)
#if os(macOS)
                .toggleStyle(.checkbox)
#else
                .toggleStyle(.switch)
#endif
                .font(Orbitron.mono(size: 11))
                .tint(.cyberCyan)
                .frame(maxWidth: .infinity, alignment: .leading)

            // Action
            Button("ACCESS") {
                vm.login(email: email, password: password)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)

            // Error banner
            if let err = vm.errorMsg {
                Text(err)
                    .font(Orbitron.mono(size: 11))
                    .foregroundColor(.cyberRed)
            }
        }
        .padding(40)
        .frame(width: 360)
        .foregroundColor(.white)
    }
}

// MARK: - Preview helper ----------------------------------------------------

private extension AuthViewModel {
    /// A benign stub so the preview compiles without talking to the backend.
    static var previewStub: AuthViewModel {
        let vm = AuthViewModel()
        vm.cachedEmail = "user@example.com"
        return vm
    }
}

#Preview {
    LoginView(vm: .previewStub)          // ✅ no placeholder – compiler happy
        .background(Color.cyberBg)       // optional: match global backdrop
}
