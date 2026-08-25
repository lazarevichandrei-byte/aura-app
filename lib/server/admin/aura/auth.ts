import "server-only";

import {validateTelegramInitData} from "../../../telegram-auth";
import {authorizeAuraAdminRequestV1} from "./auth-core";

export function authorizeAuraAdmin(initData:unknown){return authorizeAuraAdminRequestV1({initData,allowlist:process.env.AURA_ADMIN_TELEGRAM_IDS,validate:validateTelegramInitData});}
