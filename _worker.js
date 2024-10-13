/**
 * YouTube Channel: https://youtube.com/@AM_CLUB
 * GitHub Repository: https://github.com/amclubs
 * Telegram Group: https://t.me/AM_CLUBS
 * Personal Blog: https://am.809098.xyz
 */

// @ts-ignore
import { connect } from 'cloudflare:sockets';

// Generate your own UUID using the following command in PowerShell:
// Powershell -NoExit -Command "[guid]::NewGuid()"
let userID = 'auto';

// https://cloudflare-dns.com/dns-query or https://dns.google/dns-query
// DNS-over-HTTPS URL
let dohURL = 'https://sky.rethinkdns.com/1:-Pf_____9_8A_AMAIgE8kMABVDDmKOHTAKg=';

// Preferred address API interface
let ipUrlTxt = [
    'https://raw.githubusercontent.com/amclubs/am-cf-tunnel/main/ipv4.txt',
    // 'https://raw.githubusercontent.com/amclubs/am-cf-tunnel/main/ipv6.txt'
];
let ipUrlCsv = [
    // 'https://raw.githubusercontent.com/amclubs/am-cf-tunnel/main/ipv4.csv'
];
// Preferred addresses with optional TLS subscription
let ipLocal = [
    'icook.hk#t.me/AM_CLUBS 加入频道解锁更多优选节点',
    'visa.cn:443#youtube.com/@AM_CLUB 订阅频道获取更多教程'
    // 'cloudflare.cfgo.cc:443#关注YouTube频道@AM_CLUB'
];
let noTLS = 'false';
let sl = 5;

// let tagName = 'amclubs';
let subUpdateTime = 6; // Subscription update time in hours
let timestamp = 4102329600000; // Timestamp for the end date (2099-12-31)
let total = 99 * 1125899906842624; // PB (perhaps referring to bandwidth or total entries)
let download = Math.floor(Math.random() * 1099511627776);
let upload = download;

// Regex pattern to match IP addresses and ports
// let regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[.*\]):?(\d+)?#?(.*)?$/;

// Network protocol type
let network = 'ws'; // WebSocket

// Fake UUID and hostname for configuration generation
let fakeUserID;
let fakeHostName;

// Subscription and conversion details
let subProtocol = 'https';
let subConverter = 'url.v1.mk'; // Subscription conversion backend using Sheep's function
let subConfig = "https://raw.githubusercontent.com/amclubs/ACL4SSR/main/Clash/config/ACL4SSR_Online_Full_MultiMode.ini"; // Subscription profile
let fileName = 'youtube.com/@am_club';
let isBase64 = true;

let botToken = '';
let chatID = '';



export default {
    /**
     * @param {import("@cloudflare/workers-types").Request} request
     * @param {{UUID: string,  DNS_RESOLVER_URL: string, NODE_ID: int, API_HOST: string, API_TOKEN: string}} env
     * @returns {Promise<Response>}
     */
    async fetch(request, env) {
        try {
            // Destructure environment variables for clarity
            const {
                TOKEN,
                HOST,
                PASSWORD,
                DNS_RESOLVER_URL,
                IP_LOCAL,
                IP_URL_TXT,
                IP_URL_CSV,
                NO_TLS,
                SL,
                SUB_CONFIG,
                SUB_CONVERTER,
                SUB_NAME,
                TG_TOKEN,
                TG_ID

            } = env;

            userID = (TOKEN || userID).toLowerCase();

            const url = new URL(request.url);
            dohURL = (DNS_RESOLVER_URL || dohURL);

            if (IP_LOCAL) {
                ipLocal = await addIpText(IP_LOCAL);
            }
            if (IP_URL_TXT) {
                ipUrlTxt = await addIpText(IP_URL_TXT);
            }
            if (IP_URL_CSV) {
                ipUrlCsv = await addIpText(IP_URL_CSV);
            }

            noTLS = (NO_TLS || noTLS);
            sl = (SL || sl);
            subConfig = (SUB_CONFIG || subConfig);
            subConverter = (SUB_CONVERTER || subConverter);
            fileName = (SUB_NAME || subConverter);
            botToken = (TG_TOKEN || botToken);
            chatID = (TG_ID || chatID);

            // Unified protocol for handling subconverters
            const [subProtocol, subConverterWithoutProtocol] = (subConverter.startsWith("http://") || subConverter.startsWith("https://"))
                ? subConverter.split("://")
                : [undefined, subConverter];
            subConverter = subConverterWithoutProtocol;

            //const uuid = url.searchParams.get('uuid')?.toLowerCase() || 'null';
            const ua = request.headers.get('User-Agent') || 'null';
            const userAgent = ua.toLowerCase();
            const host = (url.searchParams.get('host') || HOST || request.headers.get('Host'));
            const password = (url.searchParams.get('password') || PASSWORD || userID);

            // Calculate expiry and upload/download limits
            const expire = Math.floor(timestamp / 1000);

            fakeUserID = await getFakeUserID(userID);
            fakeHostName = fakeUserID.slice(6, 9) + "." + fakeUserID.slice(13, 19);
            console.log(`userID: ${userID}`);
            console.log(`fakeUserID: ${fakeUserID}`);
            // Handle routes based on the path
            switch (url.pathname.toLowerCase()) {
                case '/': {
                    // Serve the nginx disguise page
                    return new Response(await nginx(), {
                        headers: {
                            'Content-Type': 'text/html; charset=UTF-8',
                            'referer': 'https://www.google.com/search?q=am.809098.xyz',
                        },
                    });
                }

                case `/${fakeUserID}`: {
                    // Disguise UUID node generation
                    const fakeConfig = await getTROJANConfig(userID, host, 'CF-FAKE-UA', url);
                    return new Response(fakeConfig, { status: 200 });
                }

                case `/${userID}`: {
                    // Handle real UUID requests and get node info
                    await sendMessage(
                        `#获取订阅 ${fileName}`,
                        request.headers.get('CF-Connecting-IP'),
                        `UA: ${userAgent}\n域名: ${url.hostname}\n入口: ${url.pathname + url.search}`
                    );

                    const trojanConfig = await getTROJANConfig(password, host, userAgent, url);
                    const isMozilla = userAgent.includes('mozilla');

                    // Prepare common headers
                    const commonHeaders = {
                        "Content-Type": isMozilla ? "text/html;charset=utf-8" : "text/plain;charset=utf-8",
                        "Profile-Update-Interval": `${subUpdateTime}`,
                        "Subscription-Userinfo": `upload=${upload}; download=${download}; total=${total}; expire=${expire}`,
                    };

                    // Add download headers if not a Mozilla browser
                    if (!isMozilla) {
                        commonHeaders["Content-Disposition"] = `attachment; filename=${fileName}; filename*=utf-8''${encodeURIComponent(fileName)}`;
                    }

                    return new Response(trojanConfig, {
                        status: 200,
                        headers: commonHeaders,
                    });
                }

                default: {
                    // Serve the default nginx disguise page
                    return new Response(await nginx(), {
                        headers: {
                            'Content-Type': 'text/html; charset=UTF-8',
                            'referer': 'https://www.google.com/search?q=am.809098.xyz',
                        },
                    });
                }
            }
        } catch (err) {
            // Log error for debugging purposes
            console.error('Error processing request:', err);
            return new Response(`Error: ${err.message}`, { status: 500 });
        }
    },
};


/** ---------------------Tools------------------------------ */

export async function hashHex_f(string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).slice(1));
}

async function getFakeUserID(userID) {
    const date = new Date().toISOString().split('T')[0];
    const rawString = `${userID}-${date}`;

    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawString));
    const hashArray = Array.from(new Uint8Array(hashBuffer)).map(b => ('00' + b.toString(16)).slice(-2)).join('');

    return `${hashArray.substring(0, 8)}-${hashArray.substring(8, 12)}-${hashArray.substring(12, 16)}-${hashArray.substring(16, 20)}-${hashArray.substring(20, 32)}`;
}

function revertFakeInfo(content, userID, hostName) {
    //console.log(`revertFakeInfo-->: isBase64 ${isBase64} \n content: ${content}`);
    if (isBase64) {
        content = atob(content);//Base64 decrypt
    }
    content = content.replace(new RegExp(fakeUserID, 'g'), userID).replace(new RegExp(fakeHostName, 'g'), hostName);
    if (isBase64) {
        content = btoa(content);//Base64 encryption
    }
    return content;
}

async function addIpText(envAdd) {
    var addText = envAdd.replace(/[	|"'\r\n]+/g, ',').replace(/,+/g, ',');
    //console.log(addText);
    if (addText.charAt(0) == ',') {
        addText = addText.slice(1);
    }
    if (addText.charAt(addText.length - 1) == ',') {
        addText = addText.slice(0, addText.length - 1);
    }
    const add = addText.split(',');
    // console.log(add);
    return add;
}


/** ---------------------Get data------------------------------ */

let subParams = ['sub', 'base64', 'b64', 'clash', 'singbox', 'sb'];
/**
 * @param {string} userID
 * @param {string | null} host
 * @param {string} userAgent
 * @param {string} _url
 * @returns {Promise<string>}
 */
async function getTROJANConfig(userID, host, userAgent, _url) {
    // console.log(`------------getTROJANConfig------------------`);
    // console.log(`userID: ${userID} \n host: ${host} \n userAgent: ${userAgent} \n _url: ${_url}`);

    userAgent = userAgent.toLowerCase();

    // Get node information
    fakeHostName = getFakeHostName(host);
    const ipUrlTxtAndCsv = await getIpUrlTxtAndCsv(noTLS);

    // console.log(`txt: ${ipUrlTxtAndCsv.txt} \n csv: ${ipUrlTxtAndCsv.csv}`);
    let content = await getSubscribeNode(userAgent, _url, host, fakeHostName, fakeUserID, noTLS, ipUrlTxtAndCsv.txt, ipUrlTxtAndCsv.csv);

    return _url.pathname === `/${fakeUserID}` ? content : revertFakeInfo(content, userID, host);

}


function getFakeHostName(host) {
    if (host.includes(".pages.dev")) {
        return `${fakeHostName}.pages.dev`;
    } else if (host.includes(".workers.dev") || host.includes("notls") || noTLS === 'true') {
        return `${fakeHostName}.workers.dev`;
    }
    return `${fakeHostName}.xyz`;
}

async function getIpUrlTxtAndCsv(noTLS) {
    if (noTLS === 'true') {
        return {
            txt: await getIpUrlTxt(ipUrlTxt),
            csv: await getIpUrlCsv('FALSE')
        };
    }
    return {
        txt: await getIpUrlTxt(ipUrlTxt),
        csv: await getIpUrlCsv('TRUE')
    };
}

async function getIpUrlTxt(ipUrlTxts) {
    if (!ipUrlTxts || ipUrlTxts.length === 0) {
        return [];
    }

    let ipTxt = "";

    // Create an AbortController object to control the cancellation of fetch requests
    const controller = new AbortController();

    // Set a timeout to trigger the cancellation of all requests after 2 seconds
    const timeout = setTimeout(() => {
        controller.abort(); // Cancel all requests
    }, 2000);

    try {
        // Use Promise.allSettled to wait for all API requests to complete, regardless of success or failure
        // Iterate over the api array and send a fetch request to each API URL
        const responses = await Promise.allSettled(ipUrlTxts.map(apiUrl => fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;',
                'User-Agent': 'amclubs/am-cf-tunnel'
            },
            signal: controller.signal // Attach the AbortController's signal to the fetch request to allow cancellation when needed
        }).then(response => response.ok ? response.text() : Promise.reject())));

        // Iterate through all the responses
        for (const response of responses) {
            // Check if the request was fulfilled successfully
            if (response.status === 'fulfilled') {
                // Get the response content
                const content = await response.value;
                ipTxt += content + '\n';
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        // Clear the timeout regardless of success or failure
        clearTimeout(timeout);
    }

    // Process the result using addIpText function
    const newIpTxt = await addIpText(ipTxt);
    // console.log(`ipUrlTxts: ${ipUrlTxts} \n ipTxt: ${ipTxt} \n newIpTxt: ${newIpTxt} `);

    // Return the processed result
    return newIpTxt;
}

async function getIpUrlCsv(tls) {
    // Check if the CSV URLs are valid
    if (!ipUrlCsv || ipUrlCsv.length === 0) {
        return [];
    }

    const newAddressesCsv = [];

    // Fetch and process all CSVs concurrently
    const fetchCsvPromises = ipUrlCsv.map(async (csvUrl) => {
        try {
            const response = await fetch(csvUrl);

            // Ensure the response is successful
            if (!response.ok) {
                console.error('Error fetching CSV:', response.status, response.statusText);
                return;
            }

            // Parse the CSV content and split it into lines
            const text = await response.text();
            const lines = text.includes('\r\n') ? text.split('\r\n') : text.split('\n');

            // Ensure we have a non-empty CSV
            if (lines.length < 2) {
                console.error('CSV file is empty or has no data rows');
                return;
            }

            // Extract the header and get required field indexes
            const header = lines[0].trim().split(',');
            const tlsIndex = header.indexOf('TLS');
            const ipAddressIndex = 0; // Assuming the first column is IP address
            const portIndex = 1; // Assuming the second column is port
            const dataCenterIndex = tlsIndex + 1; // Data center assumed to be right after TLS
            const speedIndex = header.length - 1; // Last column for speed

            // If the required fields are missing, skip this CSV
            if (tlsIndex === -1) {
                console.error('CSV file missing required TLS field');
                return;
            }

            // Process the data rows
            for (let i = 1; i < lines.length; i++) {
                const columns = lines[i].trim().split(',');

                // Skip empty or malformed rows
                if (columns.length < header.length) {
                    continue;
                }

                // Check if TLS matches and speed is greater than sl
                const tlsValue = columns[tlsIndex].toUpperCase();
                const speedValue = parseFloat(columns[speedIndex]);

                if (tlsValue === tls && speedValue > sl) {
                    const ipAddress = columns[ipAddressIndex];
                    const port = columns[portIndex];
                    const dataCenter = columns[dataCenterIndex];
                    newAddressesCsv.push(`${ipAddress}:${port}#${dataCenter}`);
                }
            }
        } catch (error) {
            console.error('Error processing CSV URL:', csvUrl, error);
        }
    });

    // Wait for all CSVs to be processed
    await Promise.all(fetchCsvPromises);

    return newAddressesCsv;
}

const protocolTypeBase64 = 'dHJvamFu';
/**
 * Get node configuration information
 * @param {*} uuid 
 * @param {*} host 
 * @param {*} address 
 * @param {*} port 
 * @param {*} remarks 
 * @returns 
 */
function getConfigLink(uuid, host, address, port, remarks) {
    const protocolType = atob(protocolTypeBase64);

    const encryption = 'none';
    let path = '/?ed=2560';
    const fingerprint = 'randomized';
    let tls = ['tls', true];
    if (host.includes('.workers.dev') || host.includes('pages.dev')) {
        path = `/${host}${path}`;
        remarks += ' 请通过绑定自定义域名订阅！';
    }

    const v2ray = getV2rayLink({ protocolType, host, uuid, address, port, remarks, encryption, path, fingerprint, tls });
    const clash = getClashLink(protocolType, host, address, port, uuid, path, tls, fingerprint);

    return [v2ray, clash];
}

/**
 * Get vless information
 * @param {*} param0 
 * @returns 
 */
function getV2rayLink({ protocolType, host, uuid, address, port, remarks, encryption, path, fingerprint, tls }) {
    let sniAndFp = `&sni=${host}&fp=${fingerprint}`;
    if (portSet_http.has(parseInt(port))) {
        tls = ['', false];
        sniAndFp = '';
    }

    const v2rayLink = `${protocolType}://${uuid}@${address}:${port}?encryption=${encryption}&security=${tls[0]}&type=${network}&host=${host}&path=${encodeURIComponent(path)}${sniAndFp}#${encodeURIComponent(remarks)}`;
    return v2rayLink;
}

/**
 * getClashLink
 * @param {*} protocolType 
 * @param {*} host 
 * @param {*} address 
 * @param {*} port 
 * @param {*} uuid 
 * @param {*} path 
 * @param {*} tls 
 * @param {*} fingerprint 
 * @returns 
 */
function getClashLink(protocolType, host, address, port, uuid, path, tls, fingerprint) {
    return `- {type: ${protocolType}, name: ${host}, server: ${address}, port: ${port}, password: ${uuid}, network: ${network}, tls: ${tls[1]}, udp: false, sni: ${host}, client-fingerprint: ${fingerprint}, skip-cert-verify: true,  ws-opts: {path: ${path}, headers: {Host: ${host}}}}`;

    // 	return `
    //   - type: ${protocolType}
    //     name: ${host}
    //     server: ${address}
    //     port: ${port}
    //     uuid: ${uuid}
    //     network: ${network}
    //     tls: ${tls[1]}
    //     udp: false
    //     sni: ${host}
    //     client-fingerprint: ${fingerprint}
    //     ws-opts:
    //       path: "${path}"
    //       headers:
    //         host: ${host}
    // 	`;
}


let portSet_http = new Set([80, 8080, 8880, 2052, 2086, 2095, 2082]);
let portSet_https = new Set([443, 8443, 2053, 2096, 2087, 2083]);
/**
 * 
 * @param {*} host 
 * @param {*} uuid 
 * @param {*} noTLS 
 * @param {*} ipUrlTxt 
 * @param {*} ipUrlCsv 
 * @returns 
 */
async function getSubscribeNode(userAgent, _url, host, fakeHostName, fakeUserID, noTLS, ipUrlTxt, ipUrlCsv) {
    // Use Set object to remove duplicates
    const uniqueIpTxt = [...new Set([...ipLocal, ...ipUrlTxt, ...ipUrlCsv])];
    let responseBody = splitNodeData(uniqueIpTxt, noTLS, fakeHostName, fakeUserID, userAgent);
    // console.log(`getSubscribeNode---> responseBody: ${responseBody} `);

    if (!userAgent.includes(('CF-FAKE-UA').toLowerCase())) {

        let url = `https://${host}/${fakeUserID}`;

        if (isClashCondition(userAgent, _url)) {
            isBase64 = false;
            url = createSubConverterUrl('clash', url, subConfig, subConverter, subProtocol);
        } else if (isSingboxCondition(userAgent, _url)) {
            isBase64 = false;
            url = createSubConverterUrl('singbox', url, subConfig, subConverter, subProtocol);
        } else {
            return responseBody;
        }
        const response = await fetch(url, {
            headers: {
                'User-Agent': `${userAgent} am-cf-tunnel/amclubs`
            }
        });
        responseBody = await response.text();
        //console.log(`getSubscribeNode---> url: ${url} `);
    }

    return responseBody;
}

function createSubConverterUrl(target, url, subConfig, subConverter, subProtocol) {
    return `${subProtocol}://${subConverter}/sub?target=${target}&url=${encodeURIComponent(url)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
}

function isClashCondition(userAgent, _url) {
    return (userAgent.includes('clash') && !userAgent.includes('nekobox')) || (_url.searchParams.has('clash') && !userAgent.includes('subConverter'));
}

function isSingboxCondition(userAgent, _url) {
    return userAgent.includes('sing-box') || userAgent.includes('singbox') || ((_url.searchParams.has('singbox') || _url.searchParams.has('sb')) && !userAgent.includes('subConverter'));
}

/**
 * 
 * @param {*} uniqueIpTxt 
 * @param {*} noTLS 
 * @param {*} host 
 * @param {*} uuid 
 * @returns 
 */
function splitNodeData(uniqueIpTxt, noTLS, host, uuid, userAgent) {
    // Regex to match IPv4 and IPv6
    const regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[.*\]):?(\d+)?#?(.*)?$/;

    // Region codes mapped to corresponding emojis
    const regionMap = {
        'SG': '🇸🇬 SG',
        'HK': '🇭🇰 HK',
        'KR': '🇰🇷 KR',
        'JP': '🇯🇵 JP',
        'GB': '🇬🇧 GB',
        'US': '🇺🇸 US',
        'TW': '🇼🇸 TW',
        'CF': '📶 CF'
    };

    const responseBody = uniqueIpTxt.map(ipTxt => {
        let address = ipTxt;
        let port = "443";
        let remarks = "";

        const match = address.match(regex);
        if (match) {
            address = match[1];
            port = match[2] || port;
            remarks = match[3] || address;
        } else {
            let ip, newPort, extra;

            if (ipTxt.includes(':') && ipTxt.includes('#')) {
                [ip, newPort, extra] = ipTxt.split(/[:#]/);
            } else if (ipTxt.includes(':')) {
                [ip, newPort] = ipTxt.split(':');
            } else if (ipTxt.includes('#')) {
                [ip, extra] = ipTxt.split('#');
            } else {
                ip = ipTxt;
            }

            address = ip;
            port = newPort || port;
            remarks = extra || address;

            // console.log(`splitNodeData---> ip: ${ip} \n extra: ${extra} \n port: ${port}`);
        }

        // Replace region code with corresponding emoji
        remarks = regionMap[remarks] || remarks;

        // Check if TLS is disabled and if the port is in the allowed set
        if (noTLS !== 'true' && portSet_http.has(parseInt(port))) {
            return null; // Skip this iteration
        }

        const [v2ray, clash] = getConfigLink(uuid, host, address, port, remarks);
        return v2ray;
    }).filter(Boolean).join('\n');

    let base64Response = responseBody;
    return btoa(base64Response);
}


/** ---------------------Get CF data------------------------------ */

const API_URL = 'http://ip-api.com/json/';
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
/**
 * Send message to Telegram channel
 * @param {string} type 
 * @param {string} ip I
 * @param {string} [add_data=""] 
 */
async function sendMessage(type, ip, add_data = "") {
    if (botToken && chatID) {
        try {
            const ipResponse = await fetch(`${API_URL}${ip}?lang=zh-CN`);
            let msg = `${type}\nIP: ${ip}\n${add_data}`;

            if (ipResponse.ok) {
                const ipInfo = await ipResponse.json();
                msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
            } else {
                console.error(`Failed to fetch IP info. Status: ${ipResponse.status}`);
            }

            const telegramUrl = `${TELEGRAM_API_URL}${botToken}/sendMessage`;
            const params = new URLSearchParams({
                chat_id: chatID,
                parse_mode: 'HTML',
                text: msg
            });

            await fetch(`${telegramUrl}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36'
                }
            });

        } catch (error) {
            console.error('Error sending message:', error);
        }
    } else {
        console.warn('botToken or chatID is missing.');
    }
}


/** -------------------Home page-------------------------------- */
async function nginx() {
    const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>

	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>

	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
    return text;
}