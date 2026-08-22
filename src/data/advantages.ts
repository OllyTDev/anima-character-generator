import { abilities, secondaryAbilities } from "./abilities";
import { culturalRoots } from "./culturalRoots";
import { magicPaths } from "./magicPaths";
import { psychicDisciplines } from "./psychicDisciplines";
import { tables } from "./tables";
import type { AdvantageDef } from "./types";

function psychicPowerNames(): string[] {
  const names: string[] = [];
  for (const [discipline, powers] of Object.entries(psychicDisciplines.disciplines)) {
    names.push(`------------ ${discipline} ------------`);
    names.push(...Object.keys(powers));
  }
  return names;
}

export const advantages: Record<string, AdvantageDef> = {
  "Access to Natural Psychic Powers": {
    effect: "The character has a limited psychic capacity that allows him to use one Psychic Ability unconsciously. They don't know the origin of the power or have complete control over it, but they can use it whenever they needs to. Effects: The character can naturally use one specific Psychic Ability. They are not a true psychic and cannot use Psychic Points to acquire new abilities or to harness the power that they have. their psychic potential is not based on Willpower and does not require rolling dice, but automatically is Difficult (120). The chosen power can be of any level, but it cannot have a base requirement greater than Difficult. It can be used once per minute without the character suffering a penalty, but each additional use without the required rest inflicts 1 point of Fatigue. Spending additional points increases the natural psychic potential to Very Difficult (140) and Absurd (180), respectively.",
    Cost: [1, 2, 3],
    Options: psychicPowerNames(),
    Option_Title: "Select a Power",
  },
  "Access to One Psychic Discipline": {
    effect: "The character is gifted with the ability to use the powers of a single psychic discipline. Its abilities are limited to a single field and, no matter how much it increases their potential, they will not have access to powers that are greater than their natural capacities. Effects: This Advantage allows use of PP to acquire affinity to a single psychic discipline and the matrix powers.",
    Cost: 1,
    Options: Object.keys(psychicDisciplines.disciplines),
    Option_Title: "Select a discipline",
  },
  "Acute Senses": {
    effect: "The character’s senses are as developed as those of an animal. Effects: This Advantage adds 1 point to the character’s Perception when making Characteristic Checks. It also adds a special bonus of +30 to Notice and Search", Cost: 1 },
  "Add One Point to a Characteristic": {
    effect: "One of the character’s attributes is greater than before. Effects: Add a point to the value of a single Characteristic. Restriction: Strength, Dexterity, Agility, and Constitution cannot be increased to more than 11 through this Advantage. Intelligence, Power, Willpower, and Perception cannot be increased to more than 13 through this Advantage. Special: You may take this Advantage as many times as you wish.",
    Cost: 1,
    Options: [...tables.characteristics],
    Option_Title: "Select the characteristic to increase",
  },
  Ambidextrous: {

    effect: "An ambidextrous person can use both hands equally well. Effects: An ambidextrous character can perform maneuvers with either hand. In combat, they suffer only –10 to attacks with an additional weapon.", Cost: 1 },
  "Amplify Sustained Power": {
    effect: "A character with this Advantage can maintain their psychic powers with more force. Effects: Any powers maintained in this way are one difficulty level higher than what the psychic could normally attain.", Category: "Psychic", Cost: 2 },
  "Animal Affinity": {
    effect: "A character with this Advantage has a special link with animals that allows him to obtain a positive reaction. They are also able to communicate in a limited way with them, understanding their general intentions, and vice versa. Effects: The limits of this Advantage must be decided by the GM. In any case, an animal trained to attack will still do so in spite of this Advantage, but probably after giving a warning and offering the character an opportunity to escape. When combat against an animal is unavoidable, a character with this Advantage will always be the last person attacked if they are in a group.", Cost: 1 },
  "Aptitude in a Field": {
    effect: "As per Aptitude in a Subject, except that in this case, the character has a great capacity to learn an entire area of Secondary Abilities. Effects: The Development Cost for a field of Secondary Abilities is reduced by 1 point. If the character’s class offers a Secondary Ability within this field at a reduced cost, the benefits of this Advantage apply in addition to the class benefit. For example, if an Explorer decides to reduce the cost of the abilities of the Intellectual field, these will cost 2 instead of 3. The Medicine ability, which normally costs 2, will now cost only 1. Restrictions: Development Costs cannot be reduced below 1. This Advantage works only for Secondary Abilities.", Cost: 2, Options: [...tables.fields], Option_Title: "Select a field" },
  "Aptitude in a Subject": {
    effect: "A character with this Advantage has an enormous capacity to learn a single Secondary Ability, which allows him to develop it with very little effort. Effects: This Advantage reduces the Development Cost of a single Secondary Ability for each Creation Point spent. For example, a Wizard’s player could reduce the cost of the Composure ability from 3 to 2 if they spent 1 point on this Advantage, or even to 1 if they spent 2 points. Restrictions: Development Costs cannot be reduced below 1. This Advantage works only for Secondary Abilities.",
    Cost: [1, 2],
    Options: secondaryAbilities(true),
    Option_Title: "Select a subject",
  },
  "Aptitude for Magic Development": {
    effect: "A character with this Advantage has the capacity to understand and achieve levels of power with their spells far greater than their Intelligence would normally allow. Effects: A player can add 3 points to their character’s Intelligence to determine the maximum potential of the spell. This bonus is not applied to any other ability – not even to calculate the character’s level of magic.", Category: "Magic", Cost: 1 },
  Artifact: {

    effect: "The character possesses a mystical device of enormous power. Effects: The player and the Game Master must agree on the abilities of the device. Spending additional points increases the capabilities of the object.", Category: "Background", Cost: [1, 2, 3], Options: [], Option_Title: "Enter the name of the artifact" },
  "Artifact Affinity": {
    effect: "The character has a prodigious ability to trigger and master powers of the devices they own. Effect: The Character adds 5 points to their power characteristic when determining the time needed to understand the powers of any artifact they own", Cost: 1 },
  "Been Around": {
    effect: "The character has already had experiences in the real world, by which they have learned great lessons. Effects: The character begins the game with 50, 100, or 150 additional Experience Points, depending on the amount of Creation Points spent. For example, spending 3 CP increases the character’s Experience Points by 150. This increase permits a conventional rise in level if the necessary point total is reached.", Category: "Background", Cost: [1, 2, 3] },
  "Born Wizard": {
    effect: "Learning mystical formulas and developing spells comes naturally to the character, who is able to learn even complex spells easily. Effects: The wizard increases their level of learning on Table 1 by two levels", Category: "Magic", Cost: 1 },
  Charm: {

    effect: "The character has a certain personal magnetism that makes others react positively toward him. They always receives a positive reaction from people who do not know him, and some individuals may even be slightly more permissive with him. Effects: The limits of this Advantage must be decided by the Game Master.", Cost: 1 },
  "Combat Senses": {
    effect: "The character is gifted with a special capacity for fighting, regardless of their class, that increases one of their primary combat abilities. Effect: Every time the character gains a level, they gain an innate +5 bonus to one of the following Primary Combat Abilities: Attack, Block, or Dodge, which stacks with their innate class bonus. The character must choose the Primary Combat Ability upon taking the Combat Senses advantage, and they cannot change it later. Limitations: The modifier gained through this advantage is considered an innate bonus by class and cannot surpass +50, even if it is combined with other innate bonuses such as martial arts",
    Cost: 3,
    Options: [...tables.primary_combat_abilities],
    Option_Title: "Select an ability",
  },
  Contacts: {

    effect: "The character knows people that can offer him information, or even limited help, in times when they most needs it. Depending on the level of this advantage, the contacts will have varying degrees of usefulness or power. If they so desires, the character may also have organizational ties in Gaïa. Effects: Whenever they need it, someone with this advantage can use their contacts to gain information or limited assistance within their sphere of influence. For example, if they have contacts in the Magus Order, these contacts can keep him informed about supernatural matters, but do very little for politics or street rumors. On Table 33 there is a small list, indicating the recommended values for contacts of varying power in Gaïa. They are set at their minimum values, but players may invest larger amounts of CP to increase them. For example, if somebody spent 3 Creation Points on the Magus Order, it would mean that their known contacts are in the highest levels of the organization, and consequently will be able to offer them more assistance and information than normal.", Category: "Background", Cost: [1, 2, 3], Options: [], Option_Title: "Enter name of organization" },
  "Contested Spell Mastery": {
    effect: "The attack spells of a character with this Advantage are greater when it clashes against another Supernatural Beam. Effects: The character applies a bonus of +50 to their roll to calculate the result of a Collision against another beam.", Category: "Magic", Cost: 1 },
  "Cultural Roots": {
    effect: "The character is very rooted in the culture of their country, possessing a wide knowledge of the traditions and customs of their land. Effects: This advantage grants a special bonus to several secondary abilities, according to the character’s social status and country of origin. In each of the nations of Gaïa displays a list of the different modifiers that Cultural Roots grants.",
    Category: "Background",
    Cost: 1,
    Options: Object.keys(culturalRoots),
    Option_Title: "Select a background",
  },
  "Danger Sense": {
    effect: "Characters with this Advantage have a sixth sense, which allows them to detect when something dangerous approaches or threatens them – though they will not be able to detect the origin or nature of the danger until they see it. Effects: The character cannot be taken by surprise, unless their opponent’s Initiative score is 150 points or more higher than their", Cost: 2 },
  Disquieting: {

    effect: "A character with this Advantage can make people nervous whenever they wish. They can also discourage violence against himself or force intimidating people to agree with him. Effects: The limits of this Advantage must be decided by the Game Master.", Cost: 1 },
  "Dual Limit": {
    effect: "The character has a dual potential that allows him to bind their essence to two Limits. Effects: The character can choose up to two Limits instead of one.", Cost: 1 },
  Elan: {

    effect: "A character with this Advantage has attracted the attention of a Shajad or a Beryl. Generally, this means that an ancestor of the character was bound to the being and it still maintains some type of bond with all the members of the family. It is also possible that this attention is due to some actions the character has taken. At the moment, they enjoy its favor – although after the player begins playing their character, the relationship will depend on how they behave. Effects: The character has Elan 25 for the entity they choose. Spending additional points increases the level to 45 and 60, respectively. Thus, a character whose player spent 2 Creation Points on this Advantage would have Elan of 45 with the particular Shajad or Beryl whose favor they enjoy.", Cost: [1, 2, 3], Options: [], Option_Title: "Enter the name of the Beryl or Shajad" },
  "Elemental Compatibility": {
    effect: "A character with this Advantage is naturally compatible with the powers of a specific magical path, being simultaneously weaker in its opposite. their essence is bound strongly to this element, and their magic is more powerful when they uses those spells. Effects: The character has a special bonus of +20 to their MA and to their MR in the magical path that they choose. When they uses spells of the opposed path, they have a penalty of –20 to their MA and to their MR. If the chosen path is necromancy, apply the penalty to all other paths",
    Category: "Magic",
    Cost: 1,
    Options: [...magicPaths],
    Option_Title: "Select a path",
  },
  "Exceptional Magic Resistance": {
    effect: "Characters with this Advantage possess heightened resistance to magical attacks and effects. Effects: Add a special bonus of +25 to Magic Resistance (MR). Spending a second Creation Point increases the bonus to +50.", Cost: [1, 2] },
  "Exceptional Physical Resistance": {
    effect: "Characters with this Advantage possess heightened resistance to physical attacks and effects. Damage, poisons, and diseases do not affect them as they do other people. Effects: Add a special bonus of +25 to Physical Resistance (PhR), Venom Resistance (VR), and Disease Resistance (DR). Spending a second Creation Point increases the bonus to +50.", Cost: [1, 2] },
  "Exceptional Psychic Resistance": {
    effect: "The mind of a character with this Advantage possesses very strong mental barriers that protect him from psychic attacks and other negative psychic effects. Effects: This Advantage adds a special bonus of +25 to a character’s Psychic Resistance (PsR). Spending a second Creation Point increases the bonus to +50.", Cost: [1, 2] },
  "Extreme Concentration": {
    effect: "A character with this Advantage can concentrate much more than most psychics, thereby gaining greater benefits from their abilities. Effects: The psychic doubles the bonus they normally gains from concentration. For example, if they concentrate for a full round, they gain +20 instead of +10.", Category: "Psychic", Cost: 2 },
  Fame: {

    effect: "For one reason or another, the character is exceptionally well known everywhere. They may be a famous actor, Eden player, or have rumored legendary martial abilities (whether this is true or not). Nevertheless, they are a true celebrity. Effects: The effects of this advantage only apply to role-playing. The player must determine the source of their character’s fame at character creation. If using the optional Fame rules later in this chapter, this advantage provides 40 or 65 points of Fame, depending on the CPs invested", Category: "Background", Cost: [1, 2] },
  Familiar: {

    effect: "At one point in their life, the character was able to make a deal with a creature to be their Familiar. Effects: The character starts the game with a creature of their level as their Familiar. Spending an additional Creation Point allows the Familiar to be a level above the character’s level.", Cost: [2, 3], OllyTCost: [1, 2, 3] },
  Focus: {

    effect: "Characters with this Advantage can harness their ability more than normal and focus their powers on a particular objective. Effects: Psychic Points spent to improve Psychic Projection increase the ability by +20 instead of +10.", Category: "Psychic", Cost: 1 },
  Fortunate: {

    effect: "A Fortunate character enjoys true luck. They can often escape difficult situations due to their lucky star. Effects: The limits of this Advantage must be decided by the Game Master. In any case, the character will never suffer the negative effects of a trap or an attack determined solely by chance.", Cost: 1 },
  "Free Access to Any Psychic Discipline": {
    effect: "Characters with this Advantage may use any type of psychic discipline and its abilities. Effects: This Advantage enables the character to use as many psychic disciplines as they wish using their Psychic Points.", Cost: 2 },
  "Free Will": {
    effect: "The character has an unbreakable will when dealing with effects related to possession and domination. No matter how difficult the situation, they will tend to rebel against external influences and allow himself to be guided only by their own mandates. Effect: This grants a special bonus of +60 to any Resistance Check that is related to possession or domination", Cost: 1 },
  "Good Luck": {
    effect: "Characters with this Advantage are exceptionally lucky in everything they do and very rarely commit a serious mistake. Effects: The required number to fumble is reduced by 1 point. In normal circumstances, therefore, the character will only fumble on a roll of 2. If a character with this Advantage attains mastery in any ability, they will fumble only on a 1 when using it.", Cost: 1 },
  "Gradual Magic Learning": {
    effect: "As the character gains additional abilities and powers, their innate magical knowledge also increases. Effects: Each time they level up, the character gains +5 to their total Magic Level. Requirement: Requires the Gift", Category: "Magic", Cost: 2 },
  "Half-Attuned to the Tree": {
    effect: "As in Elemental Compatibility (see above), but in this case the character is naturally compatible with the magic of half of the Mystical Tree. Effects: The wizard has a special bonus of +20 to their MA and their MR in the five magical Paths of a segment of the Tree. In the rest, they have a penalty of –20 to their MA and their MR. Restriction: Necromancy is not included in this Advantage", Category: "Magic", Cost: 2 },
  "Hard to Kill": {
    effect: "Regardless of their Constitution value, the character has a vastly superior vitality that makes him especially hard to kill. Effect: This grants a special bonus of +10 Life Points per level, which are added to the Life Points the character normally gains for their class. For example, a warrior that has chosen this advantage would gain 25 Life Points per level (15 for their class, plus 10 from Hard to Kill). If a character spends two Creation Points, the bonus increases to +20 Life Points and spending three Creation Points increases the bonus to +30 Life Points. If you use the optional rules for Between Life and Death, this advantage also grants the character a special bonus of +10 when making Resistance Checks (or +20 or +30 if additional Creation Points are spent).", Cost: [1, 2, 3] },
  "Immunity to Pain and Fatigue": {
    effect: "A character with this Advantage is especially resistant to the effects of pain and fatigue. Effects: Penalties caused by pain and Fatigue are reduced by half.", Cost: 1 },
  "Imperceptible Ki": {
    effect: "The physical energy of the character is exceptionally difficult to detect, because it disappears without leaving a trace. Effects: This Advantage grants a special bonus of +10 to Ki Concealment per level. Limits: This Advantage does not grant any benefit if the character does not develop the Ability Ki Concealment.", Cost: 1 },
  "Improved Innate Spell": {
    effect: "A character with this Advantage can execute their innate spells with a greater potential than normal. Effects: The innate spells of the wizard add +10 to their potential as indicated by their MA. Additional Creation Points increase the value to +20 and +30, respectively. Thus a wizard with an MA of 100 whose player spent 2 points in this Advantage could cast their innate spells with a value of up to 60 (40 by their MA, plus 20 due to the Advantage).", Category: "Magic", Cost: [1, 2, 3] },
  "Incomplete Gift": {
    effect: "A character with this Advantage is born with certain capabilities for magic and sometimes can use minor spells in a similar way to truly Gifted people. Effects: The character cannot see magic, but is capable of casting spells in a limited way. Each time they use a spell, they must pass a Power check against a difficulty of 10 plus 1 for each 10 levels of the spell. If they fail, they spend Zeon as if they cast the spell, but it does not take effect.", Cost: 1, Options: [...tables.theorems], Option_Title: "Select the Theorem used" },
  "Increased Ki Accumulation": {
    effect: "When concentrating to accumulate Ki, the character is able to vastly increase their ability to gather their energies at great speed. Effects: If the character does not conduct any other Action during the turn, active or passive, than Ki Accumulation, they can add +1 to the value of all their Ki Accumulations during that turn. The investment of an additional Creation Point increases this bonus to +2. Limits: The benefits of this Advantage cannot be combined in the same turn with those of the Advantage Total Accumulation, which increases Accumulation while the character carries out other Actions", Cost: [1, 2] },
  "Increased Natural Bonus": {
    effect: "The natural progression of the character’s characteristics is far greater than what is common in other individuals. their characteristics are capable of increasing far beyond their normal values. Effect: Each time the character gains a level, they may choose any one of their Secondary Abilities and add twice the usual bonus provided by the Characteristic to that Secondary Ability", Cost: 2 },
  "Increased Psychic Modifiers": {
    effect: "The character has a special capacity to take advantage of the possible environmental conditions that influence their powers. Effect: The psychic doubles any natural modifier that their psychic discipline uses. For example, a telepath would apply +40 for being in contact with the target of their power (instead of the normal +20), and a pyrokinetic would apply +60 for finding himself within a volcano (instead of the normal +30). Any negative modifiers are also increased", Category: "Psychic", Cost: 1 },
  "Increase One Characteristic to Nine": {
    effect: "This Advantage allows a player to increase the value of one of their character’s Primary Characteristics. Effects: Substitute one Characteristic’s value for a 9, no matter what its original value was. Special: You may take this Advantage as many times as you wish",
    Cost: 2,
    Options: [...tables.characteristics],
    Option_Title: "Select the characteristic to increase",
  },
  "Jack of All Trades": {
    effect: "Characters with this Advantage can adapt to any need that arises and develop knowledge in all fields and subjects. No matter how rare or unusual the Secondary Ability needed, they will always have some knowledge or skill useful in that situation. Effects: The character never applies the –30 penalty for not spending DP in a Secondary Ability, and they also receive a special bonus of +10 in all their Secondary Abilities", Cost: 2 },
  "Ki Perception": {
    effect: "The senses of the character have the natural capacity to perceive Ki, which increases the character’s abilities of detection enormously. Effects: This Advantage grants a special bonus of +10 to Ki Detection per level. Limits: This Advantage does not grant any benefit if the character does not develop the Ability Ki Detection.", Cost: 1 },
  "Ki Recovery": {
    effect: "This Advantage allows a character’s spiritual energy to recover more quickly than normal. Effects: The character recovers 1 point of Ki every ten minutes, instead of every hour. Spending additional Creation Points decreases the recovery time to five minutes and one minute, respectively.", Cost: [1, 2, 3] },
  "Light Sleeper": {
    effect: "A character with this Advantage remains partially conscious while sleeping and is able to wake at the slightest noise or movement. Effects: The character applies a penalty of only –20 to their Notice ability while sleeping.", Cost: 1 },
  Learning: {

    effect: "Characters with this Advantage possess an enormous capacity to learn and develop their potential, always gaining the maximum benefit from whatever they have seen or done. Effects: Characters gain an additional 3 Experience Points when the Game Master grants points at the end of each game session. Spending additional Creation Points increases the benefit to 6 and 9 points, respectively.", Cost: [1, 2, 3] },
  "Magic Nature": {
    effect: "The essence of the magic user overflows with an extraordinary amount of pure magic, which increases their innate energy reserve in a supernatural way. Effect: The character gains an innate bonus of +50 Zeon points per level, which is added to any other bonus obtained through their class. Spending two or three Creation Points in this advantage increases the value of the bonus to +100 and +150 Zeon points per level, respectively.", Category: "Magic", Cost: [1, 2, 3] },
  "Magical Diction": {
    effect: "The spellcaster has a special talent when it comes to interpreting and casting spells from grimoires and books. Effect: The character does not reduce their Magic Accumulation when casting spells that are written down in grimoires, scrolls, or books", Category: "Magic", Cost: 1 },
  "Martial Learning": {
    effect: "The character has an amazing facility to master Ki Techniques and Abilities in a very short time, even those that are incredibly difficult to learn. Effects: Someone with this Advantage increases by two levels the level of learning that their MK grants him on Table 6. In this way, a character with 120 points of MK (2nd level) would actually learn as if they were at the 4th level of learning.", Cost: 1 },
  "Martial Mastery": {
    effect: "The Martial Knowledge of a character with this Advantage is superior to others of their level. Usually, the character has received special training that has allowed him to explore their Ki abilities – although it is also possible that they have simply been born with enormous natural ability. Effects: Adds 40 points to a character’s Martial Knowledge (MK). Additional Creation Points increase this amount to 80 and 120 points, respectively. For example, a character whose player spends 2 Creation Points would receive 80 additional points to their Martial Knowledge.", Cost: [1, 2, 3] },
  "Mass Summoner": {
    effect: "Someone with this Advantage is adept at summoning large numbers of creatures. Effects: Treat the character as having one additional level when summoning multiple creatures. Spending additional Creation Points increases the level of the character for this purpose up to two or three additional levels, respectively", Cost: [1, 2, 3] },
  "Masterful Seals": {
    effect: "The Seals of Invocation made by the character enjoy an unusual power, since their soul reinforces their effects enormously. Effects: When setting the Difficulty check of an invocation using Seals, the character is treated as if they have two levels more. Thus, a character of 2nd level could invoke creatures as if they were level 4", Cost: 1 },
  "Mystical Armor": {
    effect: "The character’s aura forms a layer of mystical energy that protects him against supernatural attacks. Effects: Grants a character a natural armor of 4 against energy-based attacks. Although it counts as armor, penalties are not applied for using additional armor layers", Cost: 1 },
  "Natural Armor": {
    effect: "The character has extremely resistant skin and very hard muscles – such that it is very difficult to penetrate them. Effects: Grants natural armor of 2 against all classes of attacks except energy-based ones. Although it counts as armor, penalties are not applied for using additional armor layers.", Cost: 1 },
  "Natural Knowledge of a Path": {
    effect: "A character with this Advantage possesses the capacity to cast certain spells naturally, without having to study them. They can unconsciously weave the powers of the Soul Flow for one Path – as if the Path were simply responding to their abilities. The character knows how to use the spells perfectly, but they do not understand the theory behind them, nor can they explain it to others. Effects: This Advantage grants innate knowledge of a Path at level 40 without investing Magic Level points. As it is innate knowledge, the wizard can continue to develop it beyond level 40 by spending new Magic Level points. Special: This Advantage can be acquired again for different Paths.",
    Category: "Magic",
    Cost: 1,
    Options: [...magicPaths],
    Option_Title: "Select a path",
  },
  "Natural Learner": {
    effect: "Characters with this Advantage naturally improve in a specific Secondary Ability. Effects: Grants a character an innate special modifier of +10 per level in a single Secondary Ability. Add this modifier to any other innate class-based bonus the character receives. Spending additional points on this Advantage increases the bonus to +20 and +30, respectively. Thus, a character whose player spends 2 Creation Points on this Advantage would receive a modifier of +20 per level to a single Secondary Ability",
    Cost: [1, 2, 3],
    Options: Object.keys(abilities).filter((name) => "Field" in abilities[name]),
    Option_Title: "Select an ability",
  },
  "Natural Learner, Field": {
    effect: "As Natural Learner, but in this case the character improves in all the Secondary Abilities that belong to a certain field. Effects: Grants a special +5 per level bonus to all the Secondary Abilities in a field. Add this bonus to any other innate class-based bonus the character receives. Spending an additional point on this Advantage increases the bonus to +10. Thus, a character whose player spends 3 Creation Points on this Advantage would receive a modifier of +10 per level to all Secondary Abilities in Athletics, for example.", Cost: [2, 3], Options: [...tables.fields], Option_Title: "Select a field" },
  "Natural Power": {
    effect: "The spellcaster carries out their spells using their spiritual power, empowering it with their essence in place of their knowledge. Effect: In order to calculate their maximum potential for spells, the character uses their Power Characteristic instead of their Intelligence. This advantage does not influence the level of the magical path at all, which continues to use Intelligence in the normal way", Category: "Magic", Cost: 1 },
  "Night Vision": {
    effect: "This Advantage allows a character to see in the dark and to adapt quickly to any change in light intensity. Effects: The character may ignore any penalty caused by the dark – except for magically induced dark or absolute lack of light, in which case the penalty is reduced by half.", Cost: 1 },
  "No Gestures": {
    effect: "The character does not need to make gestures to perform Seals of Invocation, since the essence of these is bound directly to their soul. Effects: The character does not reduce their Ki Accumulation, even if they are not able to use their hands.", Cost: 1 },
  "Opposite Magic": {
    effect: "Contrary to other spellcasters, the character’s magical nature is sustained by opposite and antagonistic powers. Therefore, they can use spells from opposing paths completely naturally. Effect: The character does not double the Magic Level cost for learning spells from opposite paths. For example, they could easily learn both Light and Darkness spells without needing to double any invested points.", Category: "Magic", Cost: 1 },
  "Passive Concentration": {
    effect: "A character with this Advantage can concentrate in any situation, no matter the difficulty or complications. Effects: The psychic can concentrate to harness a power even while executing active actions", Category: "Psychic", Cost: 2 },
  "Powerful Ally": {
    effect: "There is someone of significant power or influence that is willing to help the character at all times. It can be an important noble, a great crime lord or a powerful wizard, who will stop at nothing to support the character when they require assistance. Effects: The effects of this advantage only apply to role-playing. Naturally, the greater number of CPs invested, the more powerful the ally.", Category: "Background", Cost: [1, 2, 3], Options: [], Option_Title: "Enter powerful ally" },
  "Psychic Ambivalence": {
    effect: "Through psychic capabilities, the character finds himself especially empowered when using more than one power at a time, for which they gain greater bonuses than other individuals with mental abilities. Effect: When the character divides up their psychic potential in order to use more than one power per turn, they gain a cumulative bonus of +5 for each power that is declared.", Category: "Psychic", Cost: 1 },
  "Psychic Fatigue Resistance": {
    effect: "A character with this Advantage never experiences exhaustion when using their psychic powers. Effects: If a character fails in the use of one of their powers, they do not lose Fatigue when they have used up their available PP. Third level powers are not affected by this Advantage.", Category: "Psychic", Cost: 2 },
  "Psychic Immunity": {
    effect: "An individual with this advantage is exceptionally resistant to emotions, and is not usually influenced by normal fears or desires. Effect: The character receives a bonus of +60 to any Composure Check based on mitigating their emotional state. Limitations: This advantage cannot be combined with the following disadvantages: Addiction or Serious Vice, Cowardice, or Severe Phobia.", Cost: 1 },
  "Psychic Inclination": {
    effect: "A character with this Advantage has developed one of their Psychic Disciplines more than the rest of their abilities. Effects: The character automatically gains one level of difficulty greater than normal when using the powers of a specific discipline",
    Category: "Psychic",
    Cost: 2,
    Options: Object.keys(psychicDisciplines.disciplines),
    Option_Title: "Select a discipline",
  },
  "Psychic Point Recovery": {
    effect: "A character with this Advantage can easily recover from using their abilities. Effects: The character’s recovery rate for Psychic Points is 1 point every 10 minutes. Spending additional Creation Points increases the rate to 1 point every five minutes or every minute, respectively.", Category: "Psychic", Cost: [1, 2, 3] },
  "Quick Reflexes": {
    effect: "The character has exceptional reflexes that allow him to respond quickly to any situation. Effects: Grants a special bonus of +25 to a character’s Initiative score. Spending additional Creation Points will increase the bonus to +45 and +60, respectively. Thus, a character whose player spends 2 Creation Points on this Advantage receives a +45 bonus to their Initiative score.", Cost: [1, 2, 3] },
  Regeneration: {

    effect: "Wounds suffered by the character heal easily. Effects: This Advantage increases the character’s Regeneration by two levels. Spending additional points increases Regeneration by four and six levels, respectively", Cost: [1, 2, 3] },
  "Repeat a Characteristics Roll": {
    effect: "This Advantage allows a player to modify one of their character’s Primary Characteristics. Effects: Players may roll one additional die once they have generated Characteristics and use the result in place of one of the previous rolls. The new number cannot be less than the character’s lowest roll. Restriction: This Advantage is not compatible with the fourth method of generating Characteristics. Special: You may take this Advantage as many times as you wish.",
    Cost: 1,
    Options: [...tables.characteristics],
    Option_Title: "Select the characteristic to reroll",
  },
  Saint: {

    effect: "The character has received the title of Saint on behalf of The Church, which means that their powers are officially a divine gift and not a demonic emanation. Therefore, they’re free to use supernatural abilities on a limited basis, without the fear of being pursued by The Inquisition or suffering any other consequences. It is important to note that although The Church tends to be very reluctant to admit they made a mistake with an appointment, it doesn’t grant the character absolute free reign. Not only are they obligated to use their abilities in public as little as possible, but any action that The Church could construe as evil would strip him of their entitlement immediately. Effects: The effects of this advantage only apply to role-playing. Limitation: The character must have some sort of Supernatural Ability or have developed Ki Abilities to be able to take this advantage.", Category: "Background", Cost: 2 },
  Seducer: {

    effect: "A character with this advantage radiates a special magnetism to members of the opposite sex who normally find a certain attractiveness in him. Effect: The character receives +60 bonus to Persuasion Checks in all fields related to seduction when dealing with individuals of the opposite sex. Note this advantage does not grant any mystical or supernatural ability; it only provides a bonus in situations where persuasion or seduction is already possible", Cost: 1 },
  "See Supernatural": {
    effect: "A character with this Advantage can perceive the Soul Flow and at the same time perceive the energy of psychic matrices. Effects: The character sees supernatural things – including magic and psychic matrices – as spiritual creatures. they do not apply the blinded penalty in any of these situations.", Cost: 1 },
  "Sheele Essence": {
    effect: "The character is spiritually tied to Sheele essences, so if one is bound to him, it becomes much more powerful than normal. Effects: If the character binds a Sheele to him, they can give it two additional improvements upon sealing the bond.", Cost: 1 },
  "Social Position": {
    effect: "This represents that the character belongs to the highest class of society, a higher status of nobility. Therefore, they will start out with a prestigious title and a considerable personal fortune. It is important to note that they needn’t be the head of a royal house; they can be one of the heirs. Effects: In addition to its obvious role-playing effects, this advantage grants the character access to the “privileged” classes of each principality, without needing to roll any dice. Consequently, its value in Creation Points depends on the value of the class in question.", Category: "Background", Cost: [1, 2] },
  "Starting Wealth": {
    effect: "The character has a great fortune in materials and equipment. Effects: This Advantage provides starting money or equipment valued at 2,000 gold crowns (GC). Further points spent increase this amount to 5,000 and 10,000, respectively. Restriction: The Game Master may prefer to give a different amount of money, tailored to their game. In this case, both the GM and the player should decide the amount.", Category: "Background", Cost: [1, 2, 3] },
  "Superior Magic Recovery": {
    effect: "The essence of a character with this Advantage acts like a magnet for magic, and they are able to regenerate their power at a faster rate than that of other mystical individuals. Effects: The character recovers their Zeon at twice their normal Zeonic regeneration rate. Spending additional Creation Points will triple or quadruple the normal rate.", Category: "Magic", Cost: [1, 2, 3] },
  "Supernatural Immunity": {
    effect: "Due to this character’s very nature, magic is anathema to them. Therefore, they ignore many spells and supernatural effects, as if the mystical is negated completely in their presence. Depending on the level of this advantage, the character is able to ignore increasingly powerful effects. Effect: A character with this advantage automatically ignores any spell cast on their with a Zeonic value of 60 or less. In the same fashion, it grants immunity to any mystical effect that causes their to roll against a Magic Resistance of 80 or less. However, this only allows a character to avoid the direct effects of magic, and not effects derived from magic. For example, if a Light Discharge makes a roof collapse on top of a character, they would still be buried normally. Spending two Creation Points on this advantage allows the character to ignore spells with a Zeonic value of 90 or less and grants immunity to any mystical effect that forces a Magic Resistance Check of 100 or less. Spending three Creation Points increases those values to 100 and 120, respectively. Limitations: Due to their anti-magic nature, a character with this advantage cannot access the Gift or See Supernatural. In the same way Sylvain, Duk’zarist, or Daimah do not have access to Supernatural Immunity.", Cost: [1, 2, 3] },
  Survivor: {

    effect: "No matter how perilous a situation, a character with this advantage possesses a special ability to survive when on the brink of death. Effect: The character can withstand negative Life Points up to ten times their Constitution value, instead of five. Also, apply a bonus of +40 to their Physical Resistance Check to attempt to stabilize himself. Once out of the fine line between life and death, their All Action Penalty is only –30, instead of –60. If the optional rules of negative life points apply, the +40 to FR controls to resist", Cost: 1 },
  Talented: {

    effect: "This ability shows that the character has always been gifted with certain manual abilities that are far beyond their natural Dexterity. Effect: The character adds a special bonus of +30 to Sleight of Hand, and can apply a +3 to any contested Dexterity Check", Cost: 1 },
  "To the Limit": {
    effect: "When on the brink of death, the character enters a state of desperation that pushes him to surpass their normal capabilities. Effect: When the character’s Life Points are reduced below a quarter of their total, the character receives a +20 All Action Bonus. This modifier is only applied in situations where the character puts their life, or the life of others, in danger", Cost: 1 },
  "Touched by Destiny": {
    effect: "There is something special in the character that allows him to unusually influence the results of some of their actions—a touch of luck or genius that allows him to take advantage of opportunities in moments of great importance. Effect: Once per game session, when performing any kind of check, the player can repeat one of their dice rolls and choose the best result. Limitation: This advantage can be taken as many times as desired. Each time a character takes it, they receive an additional use per game sessions; therefore, a character who has taken Touched by Destiny twice can can use the ability twice per game session", Cost: 1 },
  "Total Accumulation": {
    effect: "The character is endowed with the ability to accumulate their physical energies innately, without having to concentrate to do so. Consequently, they are able to use their Ki with complete freedom, without seeing their powers reduced by any circumstances. Effects: The character does not reduce their Ki Accumulations for carrying out passive or active actions. For the purpose of play, the character always enjoys their full Accumulation, no matter what they do during their turn.", Cost: 2 },
  "The Gift": {
    effect: "The character can feel and control supernatural energies inherent within their own soul. Magic flows through their very spirit, and with the appropriate knowledge, the character with this Advantage will be able to cast spells. Effects: The character can see and use magic. They also adds a special bonus of +10 to their MR, since their supernatural nature better resists mystical effects", Cost: 2, Options: [...tables.theorems], Option_Title: "Select the Theorem used" },
  "Uncommon Size": {
    effect: "A character with this Advantage possesses an unusual Size relative to their Strength and Constitution. This allows someone who should be a colossal mass of muscles to be a small person, or vice versa. Effects: The player can increase or decrease their character’s Size up to 5 points during character creation.",
    Cost: 1,
    Options: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5],
    Option_Title: "Select the size modifier to apply",
  },
  "Unconnected Techniques": {
    effect: "The Techniques of the character are completely unconnected to each other, without the need to maintain a correlated structure among them. Effects: The character can develop or learn Dominion Techniques freely, without the necessity of following the Tree rules. That is to say, they do not need Techniques of lower level in order to learn others of higher level.", Cost: 1 },
  "Unlimited Familiars": {
    effect: "The character’s essence is shared with all the creatures they call into their service, allowing him to establish a bond of familiarity with any of them instead of limiting their bond to one entity. In some ways, the character becomes one with all the beings accompanying him, turning them into an indispensable part of their being. Effect: The character is no longer limited to only one familiar. They are able to create a bond of unity with as many creatures as desired", Cost: 2 },
  "Unspoken Casting": {
    effect: "A character with this Advantage does not need to speak to control the powers of the Soul Flow of souls. Effects: The character can cast spells in complete silence without reducing their MA.", Category: "Magic", Cost: 1 },
  Untiring: {
    effect: "A character with this Advantage possesses a superior endurance relative to what their Constitution would indicate. Effects: A player can add 3 points to their character’s Fatigue. Spending additional Creation Points adds 6 and 9 points, respectively. Thus, a character whose player spends 2 Creation Points on this Advantage would add 6 to their Fatigue score.", Cost: [1, 2, 3] },
  "Use of Armor": {
    effect: "The character has a natural competence for learning how to wear and use armor, regardless of their class. Effect: Each time the character gains a level, they receive a +5 innate bonus to the Primary Combat Ability Wear Armor, which is added to any other bonus the character may receive from their class. If the character spends two or three Creation Points, this bonus increases to +10 or +15, respectively", Cost: [1, 2, 3] },
  Versatile: {
    effect: "The character can easily adapt to change and knows how to focus their life in a different way. Therefore, they have an easier time changing classes. Effect: When the character wants to change to a new class, the cost in Development Points is halved, and they do not have to wait two levels to realize the change. In other words, a character with this advantage only needs to spend 10 Development Points to change to a different class within the same Archetype, or 20 Development Points if one or both classes are mixed and they share at least common Archetype, or 30 Development Points to change to a new class in a different Archetype than the original class", Cost: 1 },
  "Versatile Metamagic": {
    effect: "The character has a knack for developing many different Metamagic advantages. Effects: The character can choose two different starting points on the Arcana Shepirah. Requirement: Requires the Gift.", Category: "Magic", Cost: 1 },
};

export function advantageCosts(name: string, ollyTRules: boolean): number[] {
  const advantage = advantages[name];
  const cost = ollyTRules && advantage.OllyTCost ? advantage.OllyTCost : advantage.Cost;
  return typeof cost === "number" ? [cost] : [...cost];
}