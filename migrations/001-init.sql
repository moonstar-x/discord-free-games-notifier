CREATE TABLE IF NOT EXISTS GuildSettings(
    guild VARCHAR(64) NOT NULL,
    channel VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_GuildSettings
        PRIMARY KEY (guild)
);

CREATE TABLE IF NOT EXISTS GameOfferStorefront(
    id INT NOT NULL,
    name VARCHAR(256) UNIQUE NOT NULL,
    CONSTRAINT pk_GameOfferStorefront
        PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_GameOfferStorefront ON GameOfferStorefront(name);

CREATE TABLE IF NOT EXISTS GuildGameOffersEnabled(
    guild VARCHAR(64) NOT NULL,
    storefront_id INTEGER NOT NULL,
    enabled BOOL NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_GuildGameOffersEnabled
        PRIMARY KEY (guild, storefront_id),
    CONSTRAINT fk_GuildGameOffersEnabled_GuildSettings
        FOREIGN KEY (guild) REFERENCES GuildSettings(guild)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_GuildGameOffersEnabled_GameOfferStorefront
        FOREIGN KEY (storefront_id) REFERENCES GameOfferStorefront(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

INSERT INTO GameOfferStorefront(id, name) VALUES(1, 'EpicGames') ON CONFLICT DO NOTHING;
INSERT INTO GameOfferStorefront(id, name) VALUES(2, 'Steam') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION get_storefronts()
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_agg(name) FROM GameOfferStorefront
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_guild(guild_id VARCHAR)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'guild', GS.guild,
            'channel', GS.channel,
            'created_at', GS.created_at,
            'updated_at', GS.updated_at,
            'storefronts', (
                SELECT json_object_agg(
                    GOS.name,
                    json_build_object(
                        'enabled', COALESCE(GGOE.enabled, true)
                    )
                )
                FROM (
                    SELECT GOS.id, GOS.name FROM GameOfferStorefront GOS
                        LEFT JOIN GuildGameOffersEnabled GGOE ON GOS.id = GGOE.storefront_id AND GGOE.guild = guild_id
                ) GOS
                    LEFT JOIN GuildGameOffersEnabled GGOE ON GOS.id = GGOE.storefront_id AND GGOE.guild = guild_id
            )
        ) FROM GuildSettings GS
            WHERE GS.guild = guild_id
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_or_create_guild_channel(guild_id VARCHAR, new_channel_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE GuildSettings
        SET channel = new_channel_id,
            updated_at = now()
        WHERE guild = guild_id;

    IF NOT FOUND THEN
        INSERT INTO GuildSettings(guild, channel) VALUES(guild_id, new_channel_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_guild_game_offer_enabled(guild_id VARCHAR, storefront_name VARCHAR, new_enabled BOOL)
RETURNS VOID AS $$
DECLARE
    v_storefront_id INT;
BEGIN
    SELECT id INTO v_storefront_id FROM GameOfferStorefront
        WHERE name = storefront_name;

    IF v_storefront_id IS NULL THEN
        RAISE EXCEPTION 'Storefront name % not found.', storefront_name;
    END IF;

    UPDATE GuildSettings
        SET updated_at = now()
        WHERE guild = guild_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guild % not found.', guild_id;
    END IF;

    INSERT INTO GuildGameOffersEnabled(guild, storefront_id, enabled) VALUES(guild_id, v_storefront_id, new_enabled)
        ON CONFLICT (guild, storefront_id) DO UPDATE
        SET enabled = EXCLUDED.enabled;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_guild(guild_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    DELETE FROM GuildSettings WHERE guild = guild_id;
END;
$$ LANGUAGE plpgsql;
