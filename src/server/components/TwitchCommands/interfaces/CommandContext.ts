import ChatClient, { PrivateMessage } from 'twitch-chat-client';
import TwitchClient from 'twitch';
import { Twitch } from '../../Twitch';

export interface CommandContext {
	channel: string;
	user: string;
	content: string;
	text: string;
	args: string[];
	msg: PrivateMessage;
	client: ChatClient;
	twitch: TwitchClient;
	Twitch: Twitch;
}