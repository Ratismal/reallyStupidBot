export enum DiscordEvent {
	// Shard events
	SHARD_READY = 'shardReady',
	SHARD_RESUME = 'shardResume',
	SHARD_DISCONNECT = 'shardDisconnect',

	// Guild events
	GUILD_CREATE = 'guildCreate',
	GUILD_DELETE = 'guildDelete',
	GUILD_UPDATE = 'guildUpdate',

	// Message events
	MESSAGE_CREATE = 'messageCreate',
}

// comment out unneeded events
export enum TwitchChatEvent {
	CONNECT = 'CONNECT',
	REGISTER = 'REGISTER',
	DISCONNECT = 'DISCONNECT',
	PRIVMSG = 'PRIVMSG',
	ACTION = 'ACTION',
	NOTICE = 'NOTICE',
	CTCP = 'CTCP',
	CTCP_REPLY = 'CTCP_REPLY',
	TIMEOUT = 'TIMEOUT',
	BAN = 'BAN',
	CHAT_CLEAR = 'CHAT_CLEAR',
	EMOTE_ONLY = 'EMOTE_ONLY',
	FOLLOWERS_ONLY = 'FOLLOWERS_ONLY',
	HOST = 'HOST',
	HOSTED = 'HOSTED',
	HOSTS_REMAINING = 'HOSTS_REMAINING',
	JOIN = 'JOIN',
	PART = 'PART',
	R9K = 'R9K',
	UNHOST = 'UNHOST',
	RAID = 'RAID',
	RITUAL = 'RITUAL',
	SLOW = 'SLOW',
	SUBS_ONLY = 'SUBS_ONLY',
	SUB = 'SUB',
	RESUB = 'RESUB',
	SUB_GIFT = 'SUB_GIFT',
	COMMUNITY_SUB = 'COMMUNITY_SUB',
	WHISPER = 'WHISPER',
	MESSAGE = 'MESSAGE',
}