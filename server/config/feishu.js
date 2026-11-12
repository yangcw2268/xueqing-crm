// 飞书开放平台配置
const FEISHU_CONFIG = {
  appId: process.env.FEISHU_APP_ID || 'cli_aa42344f3f219bd9',
  appSecret: process.env.FEISHU_APP_SECRET || 'fIW0aR49LJYUVHzfGhRVNf44i2vMl5C7',
  redirectUri: process.env.FEISHU_REDIRECT_URI || 'http://219.135.147.236:48080/api/auth/feishu/callback/',
  // 飞书开放平台API基础地址
  apiBaseUrl: 'https://open.feishu.cn/open-apis',
  // OAuth相关路径
  tenantAccessTokenUrl: '/auth/v3/tenant_access_token/internal',
  oauthTokenUrl: '/authen/v1/oidc/access_token',
  oauthUserInfoUrl: '/authen/v1/user_info',
  // 通讯录相关路径
  contactUserListUrl: '/contact/v3/users',
  contactUserDetailUrl: '/contact/v3/users'
};

module.exports = FEISHU_CONFIG;
