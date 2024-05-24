export const fields = [
    "sid",
    "data_header.method",
    "protocol_header.correlation_id",
    "data_header.callid",
    "data_header.ruri_user",
    "data_header.from_user",
    "data_header.to_user",
    "data_header.user_agent",
    "protocol_header.srcIp",
    "protocol_header.srcPort",
    "protocol_header.dstIp",
    "protocol_header.dstPort",
    "protocol_header.timeSeconds",
    "protocol_header.timeUseconds",
    "protocol_header.payloadType",
    "protocol_header.protocolFamily",
    "protocol_header.protocol",
    "protocol_header.captureId",
    "protocol_header.capturePass",
    "data_header.cseq",
    "data_header.from_tag",
    "data_header.protocol",
    "raw",
    "profile",
    "node"
]
export const labelsForExtraction: { [key: string]: string } = {
    to_user: "To: <sip:(?<to_user>\\w+)",
    from_user: "From: <sip:(?<from_user>\\w+)",
    to_domain: "To: <sip:.*@(?<to_domain>[a-zA-Z0-9.]+)",
    from_domain: "From: <sip:.*@(?<from_domain>[a-zA-Z0-9.]+)",
    callid: "Call-ID:\\s+(?<callid>.+?)\\r\\n"
}
export const getLabelExtractions = (labels: string[]) => {
    let returnString = '';
    labels.forEach(label => {
        if (labelsForExtraction[label]) {
            returnString += `| regexp \"${labelsForExtraction[label]}\" `
        }
    })
    return returnString
}
export const baseQuery = `{job="heplify-server"} |= \`\``

export const getLabelExtractionsForSearchPanel = () => {
    return Object.values(labelsForExtraction).map(label => `| regexp \"${label}\"`).join(' ')
}
export const searchPanelQuery = `{job="heplify-server"} ${getLabelExtractionsForSearchPanel()}`
