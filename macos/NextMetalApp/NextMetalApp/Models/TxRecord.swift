//
//  TxRecords.swift
//  NextMetalApp
//

import Foundation

struct TxRecord: Identifiable, Decodable {
    let id        : String
    let timestamp : Date
    let valueEth  : Double
    let to        : String
    let statusOK  : Bool
}
