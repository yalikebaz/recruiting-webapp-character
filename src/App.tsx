import { useEffect, useState } from 'react';
import './App.css';
import CharacterClassReqs from './components/CharacterClassReqs';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';

type Attributes = {
  Strength: number
  Dexterity: number
  Constitution: number
  Intelligence: number
  Wisdom: number
  Charisma: number
}

type Skills = {
  Acrobatics: number,
  AnimalHandling: number,
  Arcana: number,
  Athletics: number,
  Deception: number,
  History: number,
  Insight: number,
  Intimidation: number,
  Investigation: number,
  Medicine: number,
  Nature: number,
  Perception: number,
  Performance: number,
  Persuasion: number,
  Religion: number,
  SleightofHand: number,
  Stealth: number,
  Survival: number,
}

type SkillModifiers = {
  name: string
  attributeModifier: string
}

const MAX_ATTRIBUTE_POINTS = 70;
const MIN_SKILL_POINTS = 10;

enum Class {
  Barbarian = 'Barbarian',
  Wizard = 'Wizard',
  Bard = 'Bard',
}

const INIT_SKILLS = { Acrobatics: 0, AnimalHandling: 0, Arcana: 0, Athletics: 0, Deception: 0, History: 0, Insight: 0, Intimidation: 0, Investigation: 0, Medicine: 0, Nature: 0, Perception: 0, Performance: 0, Persuasion: 0, Religion: 0, SleightofHand: 0, Stealth: 0, Survival: 0 }

function App() {
  const [attributes, setAttributes] = useState<Attributes>({
    Strength: 10,
    Dexterity: 10,
    Constitution: 10,
    Intelligence: 10,
    Wisdom: 10,
    Charisma: 10,
  });
  const [attributeTotal, setAttributeTotal] = useState<number>(60);

  const [skillPointsAvailable, setSkillPointsAvailable] = useState<number>();
  const [skillPointsSpent, setSkillPointsSpent] = useState<number>(0);

  const [characterName, setCharacterName] = useState<string>('');

  const [skills, setSkills] = useState<Skills>(() => {
    const initialSkills: Skills = INIT_SKILLS;
    SKILL_LIST.forEach(skill => {
      initialSkills[skill.name.replace(/\s+/g, '')] = 0;
    });
    return initialSkills;
  });

  // Recomputes skill points available based on intelligence
  useEffect(() => {
    const intelMod = computeModifier(attributes.Intelligence);
    let sp = MIN_SKILL_POINTS + (4 * intelMod) - skillPointsSpent;
    let spa = Math.max(sp, 0);
    // If we have spent more points than we have available, reset all skills to 0, calculate new skill points available, set skill points spent to 0
    // This is an edge case where user reduces intelligence after have spent points
    if (skillPointsSpent > spa) {
      // set all skills to 0, calculate new skill points available, set skill points spent to 0
      sp = MIN_SKILL_POINTS + (4 * intelMod);
      spa = Math.max(sp, 0);
      setSkills(INIT_SKILLS);
      setSkillPointsSpent(0);
      setSkillPointsAvailable(spa);
    } else {
      setSkillPointsAvailable(spa);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributes.Intelligence]);

  // Fetch initial character data on load
  useEffect(() => {
    const fetchCharacterData = async () => {
      const response = await fetch('https://recruiting.verylongdomaintotestwith.ca/api/{yalikebaz}/character');
      const data = await response.json();
      setCharacterName(data.body.name)

      setAttributes(data.body.attributes);
      setAttributeTotal(data.body.attributeTotal)

      setSkills(data.body.skills);
      const intelMod = computeModifier(data.body.attributes.Intelligence);
      const sp = MIN_SKILL_POINTS + (4 * intelMod) - data.body.skillPointsSpent;
      setSkillPointsAvailable(Math.max(sp, 0));
      setSkillPointsSpent(data.body.skillPointsSpent)
    };
    fetchCharacterData();
  }, []);

  // Checks if character is eligible for a class
  const computeEligibility = (classType: string) => {
    let eligible = true;
    for (const [key, value] of Object.entries(attributes)) {
      if (value < CLASS_LIST[classType][key]) {
        eligible = false;
        break;
      }
    }
    return eligible;
  }

  const computeModifier = (skill: number) => {
    return Math.floor((skill - 10) / 2);
  }

  const handleAttributeChange = (e: React.ChangeEvent<HTMLInputElement>, attribute: string, prevValue: number) => {
    const newValue = parseInt(e.target.value);
    if (newValue > prevValue) { // If increment - check if we are at max total attribute points
      if (attributeTotal < MAX_ATTRIBUTE_POINTS) { // If not, allow and increment
        setAttributes({ ...attributes, [attribute]: newValue });
        setAttributeTotal(attributeTotal + 1)
      }
    } else if (newValue < prevValue) { // If decrement, allow and decrement
      setAttributes({ ...attributes, [attribute]: newValue });
      setAttributeTotal(attributeTotal - 1)
    }
  }

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>, skill: SkillModifiers, prevValue: number) => {
    const skillName = skill.name.replace(/\s+/g, '');
    const newValue = parseInt(e.target.value);
    if (newValue > prevValue) { // If increment, check if we have skill points to spend
      if (skillPointsAvailable > 0) {
        setSkills({ ...skills, [skillName]: newValue });
        setSkillPointsAvailable(skillPointsAvailable - 1);
        setSkillPointsSpent(skillPointsSpent + 1)
      }
    } else if (newValue < prevValue) { // If decrement, allow and refund a point
      setSkills({ ...skills, [skillName]: newValue });
      setSkillPointsAvailable(skillPointsAvailable + 1);
      setSkillPointsSpent(skillPointsSpent - 1)
    }
  }

  // Saves character to database
  const handleSave = async () => {
    if (characterName === '') {
      alert('Please enter a character name');
      return;
    }
    const response = await fetch('https://recruiting.verylongdomaintotestwith.ca/api/{yalikebaz}/character', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: characterName,
        attributes: attributes,
        attributeTotal, // This value is being saved to remove the need to calculate it on load
        skills: skills,
        skillPointsSpent // This value is being saved to remove the need to calculate it on load
      }),
    });
    await response.json();
  }

  return (
    <>
      <header className="App-header">
        <h1>Character Sheet</h1>
      </header>
      <div className="App">

        <input type="text" className="charName" placeholder="Character Name..." value={characterName} onChange={e => setCharacterName(e.target.value)} />

        <section>

          <h2>Attributes</h2>
          <p>{`Attribute points available: ${MAX_ATTRIBUTE_POINTS - attributeTotal}`}</p>
          <div className="attributes">
            {
              ATTRIBUTE_LIST.map((attribute, index) => (
                <div key={`${characterName}-${attribute}-${index}`} className="attribute">
                  <span>{attribute} </span>
                  <input
                    className="customInput"
                    type="number"
                    onKeyDown={e => e.preventDefault()}
                    value={attributes[attribute]}
                    onChange={(e) => handleAttributeChange(e, attribute, attributes[attribute])}
                  />
                  <p>{`Modifer: ${computeModifier(attributes[attribute])}`}</p>
                </div>
              ))
            }
          </div>
        </section>

        <section>
          <h2>Classes</h2>
          <p> Click on a class to see the requirements</p>
          <div className="charClasses">
            <CharacterClassReqs classType={Class.Barbarian} eligible={computeEligibility(Class.Barbarian)} />
            <CharacterClassReqs classType={Class.Wizard} eligible={computeEligibility(Class.Wizard)} />
            <CharacterClassReqs classType={Class.Bard} eligible={computeEligibility(Class.Bard)} />
          </div>
        </section>

        <section>
          <h2>Skills</h2>
          <p>Skill points available: {skillPointsAvailable}</p>
          <div className="skills">
            {SKILL_LIST.map((skill, index) => {
              const modifier = computeModifier(attributes[skill.attributeModifier]);
              const skillName = skill.name.replace(/\s+/g, '');
              const totalSkill = skills[skillName] + modifier;

              return (
                <div key={`${characterName}-${skill.name}-${index}`} className="skill">
                  <span>{skill.name} </span>
                  <input
                    className="customInput"
                    type="number"
                    onKeyDown={e => e.preventDefault()}
                    value={skills[skillName]}
                    onChange={e => handleSkillChange(e, skill, skills[skillName])}
                    min={0}
                  />
                  <span>{` + (${modifier} from ${skill.attributeModifier}) = `}</span>
                  <span>{totalSkill}</span>
                </div>
              );
            })}
          </div>
        </section>

        <button onClick={handleSave} style={{ margin: '20px', height: '70px', width: '200px', backgroundColor: 'green' }}>Save Character</button>
      </div>
    </>
  );
}

export default App;
