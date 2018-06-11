const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const prefix = '!!';

client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

if (message.content.toLowerCase().startsWith(prefix + `novo`)) {
    const reason = message.content.split(" ").slice(1).join(" ");
    if (!message.guild.roles.exists("name", "EQUIPE")) return message.channel.send(`Este servidor não tem uma 'EQUIPE' função feita, assim que o bilhete não será aberto.\n Se você é um administrador, faça um com esse nome exatamente e dê-o aos usuários que devem poder ver bilhetes.`);
    if (message.guild.channels.exists("name", "ticket-" + message.author.username)) return message.channel.send(`Você já possui um ticket aberto!.`);
    message.guild.createChannel(`ticket-${message.author.username}`, "text").then(c => {
        let role = message.guild.roles.find("name", "EQUIPE");
        let role2 = message.guild.roles.find("name", "@everyone");
        c.overwritePermissions(role, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
        });
        c.overwritePermissions(role2, {
            SEND_MESSAGES: false,
            READ_MESSAGES: false
        });
        c.overwritePermissions(message.author, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
        });
        message.channel.send(`:white_check_mark: O ticket com criado! <#${c.id}>`);
        const embed = new Discord.RichEmbed()
        .setColor(0xCF40FA)
        .addField(`Olá ${message.author.username}!`, `Por favor, tente explicar por que você abriu este bilhete com o máximo de detalhes possível. Nossa equipe de apoio estará aqui em breve para ajudar.`)
        .setTimestamp();
        c.send({ embed: embed });
    }).catch(console.error);
}
if (message.content.toLowerCase().startsWith(prefix + `fechar`)) {
    if (!message.channel.name.startsWith(`ticket-`)) return message.channel.send(`Este comando só pode ser usado em tickets!`);

    message.channel.send(`Você tem certeza?\nPara confirmar use  \`!!confirmar\`. Caso não haja resposta, cancelaremos o pedido de encerramento do ticket em 10 segundos..`)
    .then((m) => {
      message.channel.awaitMessages(response => response.content === '!!confirmar', {
        max: 1,
        time: 10000,
        errors: ['time'],
      })
      .then((collected) => {
          message.channel.delete();
        })
        .catch(() => {
          m.edit('Encerramento de ticket cancelado, o ticket irá continuar.').then(m2 => {
          }, 3000);
        });
    });
}

});

client.on("message", msg => {
if (msg.content.startsWith(prefix + "anunciar")) {
	msg.delete()
	if(!msg.member.hasPermission("BAN_MEMBERS")) return msg.channel.send(":x: | Você não possui permissão");
	    let args = msg.content.split(" ").slice(1);
  let sayArg = args.join(" ")
if (!sayArg[0]) return msg.channel.send(`» ${prefix}anunciar «\nAnuncie algo na changelog`);
const say = new Discord.RichEmbed()
.addField(msg.guild.name, sayArg)
.setColor("#6be5d7")
.setThumbnail(msg.guild.iconURL)
.setFooter(msg.author.username, msg.author.avatarURL)
.setTimestamp()
msg.channel.send(say)
	msg.channel.send("@everyone")
}
});

const size    = config.colors;
const rainbow = new Array(size);

for (var i=0; i<size; i++) {
  var red   = sin_to_hex(i, 0 * Math.PI * 2/3); // 0   deg
  var blue  = sin_to_hex(i, 1 * Math.PI * 2/3); // 120 deg
  var green = sin_to_hex(i, 2 * Math.PI * 2/3); // 240 deg

  rainbow[i] = '#'+ red + green + blue;
}

function sin_to_hex(i, phase) {
  var sin = Math.sin(Math.PI / size * 2 * i + phase);
  var int = Math.floor(sin * 127) + 128;
  var hex = int.toString(16);

  return hex.length === 1 ? '0'+hex : hex;
}

let place = 0;
const servers = config.servers;

function changeColor() {
  for (let index = 0; index < servers.length; ++index) {		
    client.guilds.get(servers[index]).roles.find('name', config.roleName).setColor(rainbow[place])
		.catch(console.error);
		
    if(config.logging){
      console.log(`[ColorChanger] Changed color to ${rainbow[place]} in server: ${servers[index]}`);
    }
    if(place == (size - 1)){
      place = 0;
    }else{
      place++;
    }
  }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
  if(config.speed < 6000){console.log("The minimum speed is 60.000, if this gets abused your bot might get IP-banned"); process.exit(1);}
  setInterval(changeColor, config.speed);
});


client.login(process.env.CLIENT_TOKEN);
