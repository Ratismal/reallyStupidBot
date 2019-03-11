import ChatClient, { PrivateMessage } from 'twitch-chat-client';

export interface CommandContext {
	channel: string;
	user: string;
	content: string;
	text: string;
	args: string[];
	msg: PrivateMessage;
	client: ChatClient;
}