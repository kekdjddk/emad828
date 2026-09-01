const { Client, GatewayIntentBits, PermissionsBitField, SlashCommandBuilder, REST, Routes } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// تعريف الأوامر
const commands = [
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('حظر عضو من السيرفر')
        .addUserOption(option => option.setName('user').setDescription('العضو المراد حظره').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('السبب').setRequired(false)),

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('طرد عضو من السيرفر')
        .addUserOption(option => option.setName('user').setDescription('العضو المراد طرده').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('السبب').setRequired(false)),

    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('إسكات (ميوت) عضو لفترة محددة')
        .addUserOption(option => option.setName('user').setDescription('العضو المراد إسكاته').setRequired(true))
        .addIntegerOption(option => option.setName('duration').setDescription('المدة بالدقائق').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('السبب').setRequired(false)),

    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('مسح عدد معين من الرسائل')
        .addIntegerOption(option => option.setName('amount').setDescription('عدد الرسائل (من 1 إلى 100)').setRequired(true))
].map(command => command.toJSON());

client.once('ready', async () => {
    console.log(`شغال يا بطل! البوت جاهز باسم: ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken('TOKEN_HENA');

    try {
        console.log('جاري تسجيل أوامر السلاش (Slash Commands)...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('تم تسجيل الأوامر بنجاح!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, member } = interaction;

    // أمر البان
    if (commandName === 'ban') {
        if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'ما عندك صلاحية حظر الأعضاء!', ephemeral: true });
        }
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'بدون سبب';
        const targetMember = interaction.guild.members.cache.get(user.id);

        if (!targetMember) return interaction.reply({ content: 'العضو غير موجود في السيرفر.', ephemeral: true });

        await targetMember.ban({ reason });
        return interaction.reply(`تم حظر العضو ${user.tag} بنجاح. السبب: ${reason}`);
    }

    // أمر الكيك (الطرد)
    else if (commandName === 'kick') {
        if (!member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'ما عندك صلاحية طرد الأعضاء!', ephemeral: true });
        }
        const user = options.getUser('user');
        const reason = options.getString('reason') || 'بدون سبب';
        const targetMember = interaction.guild.members.cache.get(user.id);

        if (!targetMember) return interaction.reply({ content: 'العضو غير موجود في السيرفر.', ephemeral: true });

        await targetMember.kick(reason);
        return interaction.reply(`تم طرد العضو ${user.tag} بنجاح. السبب: ${reason}`);
    }

    // أمر الميوت (الإسكات المؤقت)
    else if (commandName === 'mute') {
        if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'ما عندك صلاحية إسكات الأعضاء!', ephemeral: true });
        }
        const user = options.getUser('user');
        const durationMinutes = options.getInteger('duration');
        const reason = options.getString('reason') || 'بدون سبب';
        const targetMember = interaction.guild.members.cache.get(user.id);

        if (!targetMember) return interaction.reply({ content: 'العضو غير موجود في السيرفر.', ephemeral: true });

        const durationMs = durationMinutes * 60 * 1000;
        await targetMember.timeout(durationMs, reason);
        return interaction.reply(`تم إعطاء ميوت للعضو ${user.tag} لمدة ${durationMinutes} دقيقة. السبب: ${reason}`);
    }

    // أمر مسح الرسائل (Clear)
    else if (commandName === 'clear') {
        if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'ما عندك صلاحية إدارة الرسائل!', ephemeral: true });
        }
        const amount = options.getInteger('amount');

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'يرجى تحديد عدد بين 1 و 100.', ephemeral: true });
        }

        await interaction.channel.bulkDelete(amount, true).catch(err => {
            return interaction.reply({ content: 'فشل مسح الرسائل (قد تكون قديمة أكثر من 14 يوم).', ephemeral: true });
        });

        return interaction.reply({ content: `تم مسح ${amount} رسالة بنجاح.`, ephemeral: true });
    }
});

client.login('MTU0NDM0MDA3NTA3NTA4NDM1OA.GtJhb2.Gffx3SUF1eZ_j8XvrCtNWGAc8My19rRo3QioCA');
