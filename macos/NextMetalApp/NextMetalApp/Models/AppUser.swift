//
//  AppUser.swift
//  NextMetalApp
//
// Models/AppUser.swift
import Foundation

struct AppUser: Decodable {
    let id     : String
    let email  : String
    var points: Int? = nil
}
