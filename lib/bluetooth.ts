function formatLeftRight(left: string, right: string, width = 32): string {
    const totalLength = left.length + right.length;
    const spaces = width - totalLength;
    return left + ' '.repeat(spaces > 0 ? spaces : 1) + right;
}

export async function printBluetoothReceipt(order: any) {
    if (!navigator.bluetooth) {
        throw new Error("Browser tidak mendukung Bluetooth")
    }

    // 1. Pilih device printer
    const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // GATT service umum untuk printer thermal
    })

    // 2. Koneksi ke printer
    const server = await device.gatt?.connect()
    const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
    const characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb')

    // 3. Format ESC/POS secara manual
    const ESC = '\x1B'
    const GS = '\x1D'

    const reset = ESC + '@'
    const alignCenter = ESC + 'a' + '\x01'
    const alignLeft = ESC + 'a' + '\x00'
    const alignRight = ESC + 'a' + '\x02'
    const boldOn = ESC + 'E' + '\x01'
    const boldOff = ESC + 'E' + '\x00'
    const textLarge = GS + '!' + '\x11'
    const textNormal = GS + '!' + '\x00'
    const newLine = '\n'

    let text = ''
    text += reset
    text += alignCenter + textLarge + 'MauNgopi' + newLine
    text += textNormal + 'Jl. Raya Mustikasari' + newLine
    text += '08123456789' + newLine
    text += newLine
    text += alignLeft
    text += formatLeftRight("Order type:", `${order.tag}`) + newLine
    text += `${new Date().toLocaleString()}\n`
    text += formatLeftRight("Staff:", `${order.user.name}`) + newLine
    text += formatLeftRight("Customer:", `${order.customerName}`) + newLine
    text += '-'.repeat(32) + newLine

    for (const item of order.items) {
        text += `${item.product.product} x${item.quantity}\n`
        text += alignRight + `Rp ${(item.price * item.quantity).toLocaleString("id-ID")}\n` + alignLeft
    }

    text += '-'.repeat(32) + newLine
    text += boldOn + formatLeftRight("TOTAL:", `Rp ${order.total.toLocaleString("id-ID")}`) + newLine;
    text += formatLeftRight("Payment:", `${order.invoice.paymentMethod}`) + boldOff + newLine
    text += '-'.repeat(32) + newLine
    text += formatLeftRight("Note:", `${order.memo}`) + newLine
    text += '-'.repeat(32) + newLine
    text += alignCenter + 'Have a good day' + newLine
    text += 'Thanks!' + newLine
    text += newLine.repeat(4)
    text += ESC + 'm' // cut paper (jika printer mendukung)

    // 4. Encode dan kirim ke printer
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    await characteristic?.writeValue(data)
}
