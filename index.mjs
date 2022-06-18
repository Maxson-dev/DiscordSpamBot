import fs from "node:fs/promises";
import path from "node:path/win32";
import * as readLine from 'node:readline/promises';
import {stdin as input, stdout as output} from "node:process";
import axios from "axios";
import * as process from "node:process";


const rl = readLine.createInterface( {input, output} );

const AUTH_TOKEN = await rl.question("Enter your AuthToken: ");
const CHAT_ID = await rl.question("Enter chat ID: ");
const SEND_DELAY = await rl.question("Enter delay in seconds between messages: ")*1000;
const DEL_DELAY = await rl.question("Enter delete messages delay in minutes: ")*60000;
rl.pause();


let msgs;
try {
	const strs = await fs.readFile("./msg.txt", "utf8");
	msgs = strs.split("\n");
} catch (err) {
	console.log(err);
	process.exit();
}

function randomChoice(arr) {
	return arr[Math.floor(Math.random() * arr.length + 1)];
}


const config = {
	headers: {
		'Authorization': AUTH_TOKEN,
		'Content-Type': 'application/json'
	}
};
const msgsId = [];

async function sendMes() {
	try {
		const res = await axios.post(`https://discord.com/api/v9/channels/${CHAT_ID}/messages`, JSON.stringify({
			content: randomChoice(msgs),
			tts: false
		}), config);
		msgsId.push(res.data.id);
	} catch (err) {
		console.log(err);
		sendMes();
	}
}

async function delMes() {
	for (let msg of msgsId) {
		try {
			await axios.delete(`https://discord.com/api/v9/channels/${CHAT_ID}/messages/${msg}`, {headers: {'Authorization': AUTH_TOKEN}});
		} catch (err) {
			console.log(err);
			delMes();
		}
	}
	msgsId.length = 0;
}

let sendTimer = setTimeout(async function tick() {
	try {
		await sendMes();
	} catch (err) {
		console.log(err);
	}
	sendTimer = setTimeout(tick, SEND_DELAY);
}, SEND_DELAY);

let deleteTimer = setTimeout(async function tick() {
	try {
		await delMes();
	} catch (err) {
		console.log(err);
	}
	deleteTimer = setTimeout(tick, DEL_DELAY);
}, DEL_DELAY)
