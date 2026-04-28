const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

const TOKEN = '
MTQ5ODI4MTMwNTQxMjk5NzI5MQ.G2awwg.uCffOakZrQzW0Q_My-TuquQsWcEOvdz61GfZeY';
const CLIENT_ID = '1498281305412997291';

const storage = new Map(); // Lưu thông tin acc ẩn
const orders = new Map();  // Lưu đơn hàng đang chờ

// Đăng ký lệnh /banhang
const commands = [
    new SlashCommandBuilder()
        .setName('banhang')
        .setDescription('Tạo bảng bán hàng mới')
        .addStringOption(o => o.setName('ten').setDescription('Tên tài khoản').setRequired(true))
        .addStringOption(o => o.setName('cape').setDescription('Loại Cape').setRequired(true))
        .addStringOption(o => o.setName('rank').setDescription('Rank Hypixel').setRequired(true))
        .addStringOption(o => o.setName('ban').setDescription('Tình trạng Ban').setRequired(true))
        .addStringOption(o => o.setName('bank').setDescription('Giá Bank (ví dụ: 185)').setRequired(true))
        .addStringOption(o => o.setName('card').setDescription('Giá Card (ví dụ: 240)').setRequired(true))
        .addStringOption(o => o.setName('mail').setDescription('Email (Ẩn)').setRequired(true))
        .addStringOption(o => o.setName('reco').setDescription('Mã Recovery (Ẩn)').setRequired(true))
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try { await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands }); } catch (e) { console.error(e); }
})();

client.on('ready', () => console.log(`🚀 Elite Store Bot Online: ${client.user.tag}`));

// Xử lý lệnh /banhang
client.on('interactionCreate', async interaction => {
    if (interaction.commandName === 'banhang') {
        const id = `ACC_${Date.now()}`;
        const data = {
            ten: interaction.options.getString('ten'),
            cape: interaction.options.getString('cape'),
            rank: interaction.options.getString('rank'),
            ban: interaction.options.getString('ban'),
            bank: interaction.options.getString('bank'),
            card: interaction.options.getString('card'),
            mail: interaction.options.getString('mail'),
            reco: interaction.options.getString('reco')
        };
        storage.set(id, data);

        const embed = new EmbedBuilder()
            .setTitle('🛒 THÔNG TIN TÀI KHOẢN')
            .setDescription(`👤 **Tên:** ${data.ten}\n🧣 **Cape:** ${data.cape}\n🏆 **Rank:** ${data.rank}\n🚫 **Ban Server:** ${data.ban}\n📩 **Bảo Hành:** Lock - Back 30 Ngày\n\n⚠️ **ĐỌC TRƯỚC KHI MUA:** <#ID_KENH>\n\n🏦 **Bank:** ${data.bank}K\n💳 **Card:** ${data.card}K\n\n*Thanh toán bằng CARD thì Ticket!*\n*Ấn vào nút Mua bên dưới để thanh toán Bank*`)
            .setColor('#2b2d31')
            .setThumbnail(client.user.displayAvatarURL());

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`buy_${id}`).setLabel('🎫 BUY').setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    // Khi khách ấn nút BUY
    if (interaction.isButton() && interaction.customId.startsWith('buy_')) {
        const accId = interaction.customId.split('_')[1];
        const acc = storage.get(accId);
        const maCk = `ELITE${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        
        orders.set(maCk, { accId, userId: interaction.user.id });

        const qrUrl = `https://img.vietqr.io/image/970436-SỐ_STK_CỦA_BẠN-compact2.png?amount=${acc.bank}000&addInfo=${maCk}`;

        const qrEmbed = new EmbedBuilder()
            .setTitle('🛡️ QUÉT MÃ ĐỂ THANH TOÁN')
            .setDescription(`Vui lòng chuyển khoản đúng số tiền và nội dung.\n\n📝 **Nội dung:** \`${maCk}\`\n💰 **Số tiền:** \`${acc.bank}.000đ\`\n\n⏰ Đơn hàng giữ trong **10 phút**. Sau khi thanh toán, hệ thống sẽ gửi tài khoản qua DMS!`)
            .setImage(qrUrl)
            .setColor('#f1c40f');

        await interaction.reply({ embeds: [qrEmbed], ephemeral: true });
        
        // MÔ PHỎNG: Đợi 10 giây rồi tự gửi hàng (Để test)
        // Trong thực tế, bạn sẽ dùng Webhook PayOS để kích hoạt phần này
        setTimeout(async () => {
            const user = await client.users.fetch(interaction.user.id);
            const dmEmbed = new EmbedBuilder()
                .setTitle('📬 ELITE STORE DMS')
                .setDescription(`👤 **Tên:** ${acc.ten}\n🧣 **Cape:** ${acc.cape}\n🏆 **Rank:** ${acc.rank}\n🚫 **Ban server:** ${acc.ban}\n💰 **Giá:** ${acc.bank}k\n\n📧 **Mail:** \`${acc.mail}\`\n🔑 **Recovery:** \`${acc.reco}\`\n\n📺 **Video hướng dẫn:** <Link_Video>\n\n🌟 Nếu thấy uy tín hãy cho Store 1 legit!`)
                .setColor('#2ecc71');
            await user.send({ embeds: [dmEmbed] }).catch(() => console.log("Khách chặn DM"));
        }, 10000); 
    }
});

client.login(TOKEN);
