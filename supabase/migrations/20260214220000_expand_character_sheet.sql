-- Expand characters table for full D&D 5e character sheet support

-- Extended identity
ALTER TABLE characters ADD COLUMN IF NOT EXISTS alignment text DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS experience_points integer DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS subclass text DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS subrace text DEFAULT '';

-- Combat stats
ALTER TABLE characters ADD COLUMN IF NOT EXISTS armor_class integer DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS speed integer DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS hit_dice text DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS current_hit_points integer DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS temporary_hit_points integer DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS death_saves jsonb DEFAULT '{"successes": 0, "failures": 0}';

-- Proficiency details
ALTER TABLE characters ADD COLUMN IF NOT EXISTS saving_throw_proficiencies text[] DEFAULT '{}';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_proficiencies text[] DEFAULT '{}';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}';

-- Personality
ALTER TABLE characters ADD COLUMN IF NOT EXISTS personality_traits text DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS ideals text DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS bonds text DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS flaws text DEFAULT '';

-- Features, attacks, spellcasting
ALTER TABLE characters ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS attacks jsonb DEFAULT '[]';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS spellcasting jsonb;

-- Currency
ALTER TABLE characters ADD COLUMN IF NOT EXISTS currency jsonb DEFAULT '{"cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0}';

-- Physical details
ALTER TABLE characters ADD COLUMN IF NOT EXISTS age text DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS height text DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS weight text DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS eyes text DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skin text DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS hair text DEFAULT '';
