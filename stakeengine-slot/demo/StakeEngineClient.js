const API_AMOUNT_MULTIPLIER = 1000000;

function getUrlParam(key) {
    return new URLSearchParams(window.location.search).get(key);
}

export class StakeEngineClient {
    constructor() {
        this.connected = false;
        this.demo = getUrlParam("demo") === "true";
        this.sessionID = getUrlParam("sessionID") || "";
        this.rgsUrl = getUrlParam("rgs_url") || "";
        this.lang = getUrlParam("lang") || "en";
        this.currency = getUrlParam("currency") || "USD";
        this.social = getUrlParam("social") === "true";

        this.balance = { amount: 0, currency: this.currency };
        this.config = null;
        this.round = null;
        this.jurisdiction = null;
        this.betLevels = [];
        this.minStep = 1;
        this.activeBetMode = "base";
        this.error = null;
    }

    init() {
        if (this.sessionID && this.rgsUrl) {
            this.connected = true;
            return true;
        }

        if (this.demo || !this.sessionID) {
            this.connected = false;
            this.demo = true;
            this.balance = { amount: 1000000000, currency: this.currency };
            this.betLevels = [1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0];
            this.minStep = 1;
            this.jurisdiction = {
                socialCasino: this.social,
                disabledFullscreen: false,
                disabledTurbo: false,
                disabledSuperTurbo: false,
                disabledAutoplay: false,
                disabledSlamstop: false,
                disabledSpacebar: false,
                disabledBuyFeature: false,
                displayNetPosition: false,
                displayRTP: true,
                displaySessionTimer: false,
                minimumRoundDuration: 0,
            };
            return false;
        }

        this.connected = false;
        this.demo = true;
        return false;
    }

    async authenticate() {
        if (!this.sessionID || !this.rgsUrl) return;

        try {
            const res = await fetch(`https://${this.rgsUrl}/wallet/authenticate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionID: this.sessionID,
                    language: this.lang,
                }),
            });

            const data = await res.json();

            if (data?.error) {
                this.error = data.error;
                console.error("[StakeEngine] authenticate error:", data.error);
                return;
            }

            if (data?.balance) {
                this.balance = {
                    amount: data.balance.amount / API_AMOUNT_MULTIPLIER,
                    currency: data.balance.currency || this.currency,
                };
                this.currency = this.balance.currency;
            }

            if (data?.config) {
                this.config = data.config;
                this.jurisdiction = data.config.jurisdiction || null;

                if (data.config.betLevels && data.config.betLevels.length > 0) {
                    this.betLevels = data.config.betLevels.map((l) => l / API_AMOUNT_MULTIPLIER);
                }

                if (data.config.defaultBetLevel) {
                    this.minStep = (data.config.defaultBetLevel || 1) / API_AMOUNT_MULTIPLIER;
                }
            }

            if (data?.round) {
                this.round = data.round;
                if (data.round.mode) {
                    this.activeBetMode = data.round.mode.toLowerCase();
                }
            }

            console.log("[StakeEngine] authenticated:", {
                balance: this.balance,
                betLevels: this.betLevels,
                jurisdiction: this.jurisdiction,
                round: this.round,
            });
        } catch (err) {
            console.error("[StakeEngine] authenticate failed:", err);
            this.error = { statusCode: "ERR_GE", statusMessage: err.message };
        }
    }

    async play(mode, amount) {
        if (!this.connected || !this.sessionID) {
            return { success: true, balance: this.balance, round: null };
        }

        const apiAmount = Math.round(amount * API_AMOUNT_MULTIPLIER);

        try {
            const res = await fetch(`https://${this.rgsUrl}/wallet/play`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionID: this.sessionID,
                    amount: apiAmount,
                    currency: this.currency,
                    mode: mode,
                }),
            });

            const data = await res.json();

            if (data?.error) {
                this.error = data.error;
                console.error("[StakeEngine] play error:", data.error);
                return { success: false, error: data.error };
            }

            if (data?.balance) {
                this.balance = {
                    amount: data.balance.amount / API_AMOUNT_MULTIPLIER,
                    currency: data.balance.currency || this.currency,
                };
            }

            if (data?.round) {
                this.round = data.round;
            }

            return { success: true, balance: this.balance, round: data?.round || null };
        } catch (err) {
            console.error("[StakeEngine] play failed:", err);
            return { success: false, error: { statusCode: "ERR_GE", statusMessage: err.message } };
        }
    }

    async endRound() {
        if (!this.connected || !this.sessionID) {
            return { success: true, balance: this.balance };
        }

        try {
            const res = await fetch(`https://${this.rgsUrl}/wallet/end-round`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionID: this.sessionID,
                }),
            });

            const data = await res.json();

            if (data?.error) {
                this.error = data.error;
                console.error("[StakeEngine] end-round error:", data.error);
                return { success: false, error: data.error };
            }

            if (data?.balance) {
                this.balance = {
                    amount: data.balance.amount / API_AMOUNT_MULTIPLIER,
                    currency: data.balance.currency || this.currency,
                };
            }

            return { success: true, balance: this.balance };
        } catch (err) {
            console.error("[StakeEngine] end-round failed:", err);
            return { success: false, error: { statusCode: "ERR_GE", statusMessage: err.message } };
        }
    }

    async refreshBalance() {
        if (!this.connected || !this.sessionID) {
            return this.balance;
        }

        try {
            const res = await fetch(`https://${this.rgsUrl}/wallet/balance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionID: this.sessionID,
                }),
            });

            const data = await res.json();

            if (data?.balance) {
                this.balance = {
                    amount: data.balance.amount / API_AMOUNT_MULTIPLIER,
                    currency: data.balance.currency || this.currency,
                };
            }

            return this.balance;
        } catch (err) {
            console.error("[StakeEngine] balance failed:", err);
            return this.balance;
        }
    }

    isFeatureDisabled(feature) {
        if (!this.jurisdiction) return false;
        const key = "disabled" + feature.charAt(0).toUpperCase() + feature.slice(1);
        return !!this.jurisdiction[key];
    }

    getStatus() {
        if (this.connected) {
            return `Connected (${this.currency})`;
        }
        return "Demo Mode";
    }
}

export const stakeEngineClient = new StakeEngineClient();
