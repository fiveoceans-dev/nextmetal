//  LoginView.swift
//  NextMetalApp

import SwiftUI

struct LoginView: View {
    @ObservedObject var vm: AuthVM
    @State private var email: String
    @State private var password = ""

    init(vm: AuthVM) {
        self.vm = vm
        _email  = State(initialValue: vm.cachedEmail)
    }

    var body: some View {
        VStack(spacing: 20) {
            Text("NextMetal Desktop").font(.title).bold()

            TextField("E-mail", text: $email)
                .textFieldStyle(.roundedBorder)
                .disableAutocorrection(true)
                .frame(width: 260)

            SecureField("Password", text: $password)
                .textFieldStyle(.roundedBorder)
                .frame(width: 260)

            Toggle("Remember me", isOn: $vm.remember)   // ← fixed binding
                .frame(width: 260, alignment: .leading)

            Button("Login") {
                vm.login(email: email, password: password)
            }
            .buttonStyle(.borderedProminent)

            if let err = vm.errorMsg {
                Text(err).foregroundColor(.red).font(.caption)
            }

            Spacer(minLength: 20)
        }
        .padding(40)
        .frame(width: 320, height: 320)
    }
}
