var tool = {
	toClipboard: function(data, msg) {
		var exportBox = $(`<textarea style="opacity:0"></textarea>`)
		exportBox.val(data);
		$("body").append(exportBox);
		exportBox.select();
		document.execCommand('copy');
		exportBox.remove();
		msg = msg ? msg : "已导出到剪贴板";
		alert(msg);
	},
	getTime: function() {
		var time = new Date();
		var year = time.toLocaleDateString().replace(/\//g, ".");
		var hour = time.getHours();
		var minute = time.getMinutes();
		var second = time.getSeconds();
		hour = hour < 10 ? "0" + hour : hour;
		minute = minute < 10 ? "0" + minute : minute;
		second = second < 10 ? "0" + second : second;
		return year + " " + hour + ":" + minute + ":" + second;
	}
}
var message = {
	alert: function(data, title) {
		title = title ? title.slice(0, 10) : "信息提示";
		$("body").append(this.create("alert", data, title));
	},
	prompt: function(data, title) {
		title = title ? title.slice(0, 10) : "信息收集"
		$("body").append(this.create("prompt", data, title));
	},
	confirm: function(data, title) {
		title = title ? title.slice(0, 10) : "信息确认"
		$("body").append(this.create("confirm", data, title));
	},
	create: function(type, data, title) {
		var content, tips;
		if (typeof data === "string") {
			tips = "";
			content = "<p type='content'>" + data + "</p>";
		} else {
			tips = "<p type='tips' style='color:red'>" + data[0] + "</p>";
			content = "<p type='content'>" + data[1] + "</p>";
		}
		return $(
			`<div class="message_container"><div class="message_outerBox"><div class="message_innerBox"><div class="message_head">${title}</div><div class="message_main">${tips + content}</div><div class="message_foot"><div class='message_button' type='copy' onclick='message.copy()'>全部复制</div><div class='message_button' type='close' onclick='message.close()'>关闭页面</div><div class='message_button' type='home' onclick='message.home()'>重输指令</div></div></div></div></div>`
		)[0]
	},
	copy: function() {
		tool.toClipboard($(".message_main p[type=content]").html().replace(/<br>/g, " "));
	},
	submit: function() {
		$(".message_container").remove();
	},
	close: function() {
		$(".message_container").remove();
	},
	home: function() {
		this.close();
		setTimeout(function() {
			instruct.execute(prompt("请输入指令"));
		}, 500)
	}
}
var instruct = {
	list: {
		"log": {
			"descript": "显示历史记录",
			"on": function() {
				log.alert();
			}
		},
		"log2": {
			"descript": "在控制台上显示历史记录",
			"on": function() {
				log.print();
			}
		},
		"clear": {
			"descript": "清空历史记录",
			"on": function() {
				log.clear();
			}
		},
		"copy": {
			"descript": "复制全部历史记录",
			"on": function() {
				log.copy();
			}
		},
		"add": {
			"descript": "添加一条历史记录",
			"on": function() {
				let data = prompt("请输入播放地址与时间，用英文空格隔开");
				data = data ? data.trim().split(" ") : ["", ""];
				let url = data[0] ? data[0].trim() : "";
				let time = data[1] ? data[1] : tool.getTime();
				if (url && time) {
					log.add(url, time);
				}
			}
		},
		"play": {
			"descript": "从播放记录中选择一条记录重新播放",
			"on": function() {
				let data = prompt("请输入记录编号以及播放历史时序方向，用英文空格隔开");
				data = data ? data.trim().split(" ") : ["", ""];
				let index = data[0] ? data[0] : "";
				let direction = data[1];
				if (direction === "true") {
					direction = true;
				} else if (direction === "false") {
					direction = false;
				} else {
					direction = "";
				}
				if (index) {
					log.play(index, direction);
				}
			}
		},
		"help": {
			"descript": "显示所有可用指令和可用指令功能描述",
			"on": function() {
				var msg = "";
				var list = instruct.list;
				var i = 0;
				for (let j in list) {
					i += 1;
					msg += "(" + i + ") " + j + " : " + list[j].descript + "<br>";
				}
				message.alert(msg, "指令列表");
			}
		}
	},
	execute: function(instruction) {
		instruction = typeof instruction === "string" ? instruction.trim() : "";
		if (!instruction) {
			return false;
		}
		if (/^(js|javascript):/i.test(instruction)) {
			instruction = instruction.slice(instruction.search(":") + 1);
			this.eval(instruction);
		} else {
			this.brief(instruction);
		}
	},
	brief: function(instruction) {
		instruction = this.list[instruction];
		if (instruction) {
			instruction.on();
		} else {
			alert("非法指令！");
		}
	},
	eval: function(instruction) {
		try {
			eval(instruction);
		} catch (e) {
			alert("指令错误！\n" + e);
		}
	}
}
var link = {
	check: function(url) {
		if (!
			/^((http|https|file):\/\/)?(([-A-Za-z0-9+&@#/%?=~_|!:,.;]+-[-A-Za-z0-9+&@#/%?=~_|!:,.;]+|[-A-Za-z0-9+&@#/%?=~_|!:,.;]+)\.)+([-A-Za-z0-9+&@#/%?=~_|!:,.;]+)[/\?\:]?.*$/i
			.test(url)) {
			alert("无法识别的URL");
			return false;
		}
		url = url.replace(/^((http|https):)/, "");
		var res = "default";
		res = /.m3u8/i.test(url) ? "m3u8" : res;
		res = /.flv/i.test(url) ? "flv" : res;
		return res;
	},
	get: function(type) {
		var res;
		if (type === "url") {
			res = location.href.split("?url=")[1];
		} else {
			res = $("#url_box").val();
		}
		return res ? res.replace(/\s+/g, "") : "";
	},
	convert: function(url) {
		if (!url) {
			console.log("link.convert(url)参数错误:url必选");
			return false;
		}
		var urlProtocol = /http|https/i.test(location.protocol) ? location.protocol : false;
		urlProtocol = !urlProtocol && /^(http|https):/i.test(url) ? url.split("//")[0] : false;
		urlProtocol = urlProtocol ? urlProtocol : "https:";
		return urlProtocol + "//" + url.replace(/^((http|https):)?\/\//, "");
	}
}
var play = {
	load: function(url) {
		url = url ? url : link.get();
		var player = $("#video_player");
		var sourceType = link.check(url);
		if (!sourceType) {
			return false;
		}
		try {
			console.log("正在加载视频资源:" + url);
			url = decodeURIComponent(url);
			switch (sourceType) {
				case "m3u8":
					player = play.m3u8(url, player);
					break;
				case "flv":
					player = play.flv(url, player);
					break;
				default:
					player = play.default(url, player);
					break;
			}
			player.vControl("p+");
			log.add(url);
			console.log("视频资源加载成功");
		} catch (e) {
			console.log("找不到视频资源或不支持该视频格式!");
		}
	},
	init: function(player) {
		if (!player[0]) {
			console.error("play.init(player)参数错误:player必选");
			return false;
		}
		var videoBox = $("#video_box");
		var newPlayer = player.clone();
		newPlayer.show();
		var oldPlayer = $("#real_video_player");
		if (oldPlayer[0]) {
			oldPlayer.remove();
		}
		newPlayer.attr("id", "real_video_player");
		newPlayer.css({
			width: "100%",
			height: videoBox.width() / 2 + "px"
		})
		player.hide();
		newPlayer.touch({
			left() {
				newPlayer.vControl("t-")
			},
			right() {
				newPlayer.vControl("t+");
			},
			up() {
				newPlayer.vControl("v+");
			},
			down() {
				newPlayer.vControl("v-");
			},
			longPress() {
				newPlayer.vControl("r", 3);
			},
			longPressCancel() {
				newPlayer.vControl("r", 1);
			},
			dbTap() {
				newPlayer.vControl("p") ? newPlayer.vControl("p-") : newPlayer.vControl("p+")
			}
		})
		videoBox.append(newPlayer);
		return newPlayer;
	},
	m3u8: function(url, player) {
		if (!url || !player[0]) {
			console.log("play.m3u8(url,player)参数错误:url必选,player必选");
			return false;
		}
		this.check(url);
		player = this.init(player);
		url = link.convert(url);
		if (Hls.isSupported()) {
			var hlsPlayer = new Hls();
			hlsPlayer.loadSource(url);
			hlsPlayer.attachMedia(player[0]);
			hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function() {
				//console.log("M3U8播放器加载成功!");
			});
		} else {
			var msg = "浏览器不支持MediaSource Extensions,无法加载M3U8播放器!";
			console.log(msg);
			alert(msg);
		}
		return player;
	},
	flv: function(url, player) {
		if (!url || !player[0]) {
			console.log("play.flv(url,player)参数错误:url必选,player必选");
			return false;
		}
		this.check(url);
		player = this.init(player);
		url = link.convert(url);
		if (flvjs.isSupported()) {
			var flvPlayer = flvjs.createPlayer({
				type: 'flv',
				url: url
			});
			flvPlayer.attachMediaElement(player[0]);
			flvPlayer.load();
		} else {
			var msg = "浏览器不支持MediaSource Extensions,无法加载Flv播放器!";
			console.log(msg);
			alert(msg);
		}
		return player;
	},
	default: function(url, player) {
		if (!url || !player[0]) {
			console.log("play.default(url,player)参数错误:url必选,player必选");
			return false;
		}
		player = this.init(player);
		url = link.convert(url);
		player[0].src = url;
		return player;
	},
	check: function(url) {
		if (location.hostname.search(".rth.") !== -1) {
			location.href = "https://icedwatermelonjuice.github.io/Online-Player?url=" + url;
		}
	},
	on: function() {
		this.load($("#url_box").val());
	}
}
var log = {
	get: function(direction) {
		var data = localStorage.getItem("playHistory");
		try {
			if (direction === false) {
				data = JSON.parse(data).reverse();
			} else {
				data = JSON.parse(data);
			}

		} catch (e) {
			data = [];
		}
		return (typeof data === "object" ? data : []);
	},
	display: function(data) {
		if (!data) {
			data = this.get();
		}
		var sum = 5; //显示数量
		var temp = [];
		for (let i in data) {
			if (temp.indexOf(data[i].url) === -1) {
				let num = temp.push(data[i].url);
				if (num >= sum) {
					break;
				}
			}
		}
		temp = temp.slice(0, sum);
		var html = "";
		for (let i in temp) {
			html += `<div class="history_item">${temp[i]}</div>`;
		}
		$("#play_history").html(html);
	},
	add: function(url, time) {
		url = url ? url : link.get();
		time = time ? time : tool.getTime();
		if (!url) {
			console.log("log.add(url,time)参数错误:url必选,time可选");
			return false;
		}
		var data = this.get();
		data.unshift({
			"url": url,
			"time": time
		});
		data = data.slice(0, 50);
		localStorage.setItem("playHistory", JSON.stringify(data));
		this.display(data);
	},
	clear: function() {
		localStorage.setItem("playHistory", "");
		$("#play_history").html("");
	},
	msg: function(direction) {
		var data = this.get(direction);
		var msg = "";
		if (data.length === 0) {
			return "无播放历史";
		}
		msg = "共" + data.length + "条播放历史(" + (direction === false ? "正序排列):" : "倒序排列):");
		for (let i = 0; i < data.length; i++) {
			let logIndex = (i + 1) < 10 ? "0" + (i + 1) : (i + 1);
			msg += "\n(" + logIndex + ")\n时间:" + data[i].time + "\n地址:" + data[i].url;
		}
		return msg;
	},
	alert: function(direction) {
		message.alert(this.msg(direction).replaceAll("\n", "<br>"), "播放历史");
	},
	print: function(direction) {
		console.log(this.msg(direction).replace(/<br>/g, "\n"));
	},
	copy: function(direction) {
		tool.toClipboard(this.msg(direction).replace(/\n/g, " "));
	},
	play: function(index, direction) {
		index=parseInt(index);
		var data = this.get(direction);
		data = index <= data.length ? data[index - 1].url : ""
		if (!data) {
			alert("播放记录不存在");
		}
		$("#url_box").val(data);
		$("#url_box").removeAttr("style");
		$("#url_btn")[0].click();
	}
}
var page = {
	hideHistory: function(e, jump) {
		if (jump || $("#input_box").has(e.target).length > 0) {
			return null
		}
		$("#play_history").hide();
		$("body").unbind("click", this.hideHistory);
	},
	init: function() {
		log.display();
		var urlBox = $("#url_box");
		var btn = $("#url_btn");
		var that = this;
		$("#url_box").focus(() => {
			$("#play_history").show();
			$("body").click(that.hideHistory)
		})
		urlBox.keydown((event) => {
			if (event.keyCode === 13) {
				btn[0].click(this.hideHistory);
			}
		})
		btn.mouseover(() => {
			btn.attr("class", "btn_extra_css_1");
		})
		btn.mouseleave(() => {
			btn.attr("class", "btn_extra_css_0");
		})
		btn.click(() => {
			play.on();
		})
		$("#play_history .history_item").mouseover((e) => {
			e = $(e.target);
			var l = e[0].scrollWidth - e.width(),
				t = -1;
			if (Math.abs(l) >= 1) {
				t = setTimeout(() => {
					e.data("animate_timer", "");
					e.stop();
					e.scrollLeft(0);
					e.animate({
						scrollLeft: l
					}, l * 8, "linear")
				}, 500)
				e.data("animate_timer", t);
			}
		})
		$("#play_history .history_item").mouseleave((e) => {
			e = $(e.target);
			e.data("animate_timer") && clearTimeout(e.data("animate_timer"));
			e.stop();
			e.scrollLeft(0);
		})
		$("#play_history .history_item").click((e) => {
			e = $(e.target);
			e.data("animate_timer") && clearTimeout(e.data("animate_timer"));
			e.stop();
			e.scrollLeft(0);
			$("#url_box").val(e.text());
			$("body").click();
		})
	},
	pretreat: function() {
		var urlBox = $("#url_box");
		var url = link.get("url");
		if (url) {
			urlBox.val(url);
			urlBox.removeAttr("style");
			play.load(url);
		}
	},
	instruct: function() {
		var logoClickNum = 0,
			clickTimer = -1;
		$("#logo_box").ready(function() {
			$("#logo_box").click(() => {
				clickTimer !== -1 && clearTimeout(clickTimer);
				logoClickNum += 1;
				if (logoClickNum >= 3) {
					logoClickNum = 0;
					let instruction = prompt("请输入指令");
					instruction = instruction ? instruction.trim() : "";
					instruction && instruct.execute(instruction);
				}
				clickTimer = setTimeout(() => {
					clickTimer = -1;
					logoClickNum = 0;
				}, 500)
			})
		});
	},
	onload: function() {
		this.init();
		this.pretreat();
		this.instruct();
	}
}
$("body").ready(() => {
	page.onload();
})
