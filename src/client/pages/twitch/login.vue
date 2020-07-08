<template>
	<main>
		aaaaaaaaaaaaa
	</main>
</template>

<script>
export default {
	mounted() {
		if (process.client) {
			console.log(this.$route.query, window.location.href);
			if (!this.$route.query.code) {
				let redirect = encodeURIComponent(window.location.href);
				console.log(redirect);
				// return;
				let scopes = encodeURIComponent(
					[
						'bits:read',
						'channel:read:subscriptions',
						'user:edit',
						'user:edit:broadcast',
						'user:read:broadcast',
						'channel_check_subscription',
						'channel_editor',
						'channel_feed_edit',
						'channel_feed_read',
						'channel_subscriptions',
						'channel:read:redemptions',
						'user_read',
						'user_subscriptions',
						'chat:read',
						'chat:edit',
					].join(' ')
				);
				window.location.href =
          'https://id.twitch.tv/oauth2/authorize?client_id=' +
          process.env.clientId +
          `&redirect_uri=${redirect}` +
          `&response_type=code` +
          `&scope=${scopes}`;
			} else {
				console.log(this.$route.query.code);
				this.$axios.post('/twitch/auth', {
					code: this.$route.query.code,
				});
			}
		}
	},
};
</script>
