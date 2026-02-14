"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import {
  type Character,
  type CharacterUpdate,
  DEFAULT_CHARACTER,
} from "@/types/character";

type Action =
  | { type: "UPDATE_CHARACTER"; payload: CharacterUpdate }
  | { type: "RESET" };

function characterReducer(state: Character, action: Action): Character {
  switch (action.type) {
    case "UPDATE_CHARACTER": {
      const updates = action.payload;
      return {
        ...state,
        ...updates,
        abilityScores: updates.abilityScores
          ? { ...state.abilityScores, ...updates.abilityScores }
          : state.abilityScores,
        proficiencies: updates.proficiencies ?? state.proficiencies,
        equipment: updates.equipment ?? state.equipment,
        savingThrowProficiencies: updates.savingThrowProficiencies ?? state.savingThrowProficiencies,
        skillProficiencies: updates.skillProficiencies ?? state.skillProficiencies,
        languages: updates.languages ?? state.languages,
        features: updates.features ?? state.features,
        attacks: updates.attacks ?? state.attacks,
        deathSaves: updates.deathSaves
          ? { ...state.deathSaves, ...updates.deathSaves }
          : state.deathSaves,
        spellcasting: updates.spellcasting !== undefined
          ? updates.spellcasting
            ? { ...state.spellcasting, ...updates.spellcasting }
            : updates.spellcasting
          : state.spellcasting,
        currency: updates.currency
          ? { ...state.currency, ...updates.currency }
          : state.currency,
      };
    }
    case "RESET":
      return DEFAULT_CHARACTER;
    default:
      return state;
  }
}

const CharacterContext = createContext<Character>(DEFAULT_CHARACTER);
const CharacterDispatchContext = createContext<Dispatch<Action>>(() => {});

export function CharacterProvider({ children, initialCharacter }: { children: ReactNode; initialCharacter?: Partial<Character> }) {
  const [character, dispatch] = useReducer(
    characterReducer,
    initialCharacter ? { ...DEFAULT_CHARACTER, ...initialCharacter } : DEFAULT_CHARACTER
  );

  return (
    <CharacterContext.Provider value={character}>
      <CharacterDispatchContext.Provider value={dispatch}>
        {children}
      </CharacterDispatchContext.Provider>
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  return useContext(CharacterContext);
}

export function useCharacterDispatch() {
  return useContext(CharacterDispatchContext);
}
