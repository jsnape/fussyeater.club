import adapter from 'svelte-adapter-azure-swa';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			customStaticWebAppConfig: {
				auth: {
					identityProviders: {
						azureActiveDirectory: {
							registration: {
								openIdIssuer: 'https://login.microsoftonline.com/<TENANT_ID>/v2.0',
								clientIdSettingName: 'AAD_CLIENT_ID',
								clientSecretSettingName: 'AAD_CLIENT_SECRET'
							}
						}
					}
				},
				routes: [
					{
						route: '/api/*',
						allowedRoles: ['authenticated']
					},
					{
						route: '/login',
						redirect: '/.auth/login/aad'
					},
					{
						route: '/logout',
						redirect: '/.auth/logout'
					}
				],
				responseOverrides: {
					'401': {
						redirect: '/.auth/login/aad',
						statusCode: 302
					}
				}
			}
		})
	}
};

export default config;
