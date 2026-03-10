/**
 * World 1 Institutional Overlay Labels and Cat Dialogue
 * Slice 2 extraction — behavior-preserving, data only.
 * Publishes to window.CEHP_WORLD1_TEXT
 */
(function(root){
  var ns = root.CEHP_WORLD1_TEXT || {};

  ns.WS_CAT_SPEECH = [
    'I AM A CAT','THIS IS MY JOB','MEOW IS POLITICS',
    'I VOTE EVERY DAY','THE CIGARETTE FOUND ME',
    'MY TAIL IS MY PENSION','CONSUME PRODUCE REPEAT',
    'I HAVE 200 ALOE','ED IS MY CEO',
    'THE VOID SMELLS LIKE TUESDAY','NUCLEAR? FINE.',
    'I DID NOT CHOOSE THIS','MY WHISKERS KNOW THE TRUTH',
    'WE ALL WORK FOR MOCHI NOW','HAVE YOU SEEN MY BRIEFCASE',
    'THE ECONOMY IS ME','I AM GOING TO BE OK',
    'DO YOU HAVE CIG','I AM HAUNTED BY THE PARADE',
    'WHAT IS ALOE EVEN','MY NAME IS NOT IMPORTANT',
    'I SAW THE VOID / IT SAW ME BACK','CIGARETTES COMPLETE ME',
    'MY DREAM IS TO BE A DAIKON / NO WAIT','MEOW MEANS CONSUME',
    // Philosophical tier
    'I HAVE OPINIONS','THE VOID AND I HAVE AN AGREEMENT',
    'MY PAWPRINT IS MY VOTE','CIGARETTES UNDERSTAND ME',
    'I MAKE 400 ALOE A YEAR AND I WANT MORE',
    'MEOW IS A DEMAND','THE ECONOMY IS MY FAULT',
    'I SAW WHAT THE MOCHI DID','DO NOT REPEAT THIS',
    'I AM OPTIMIZING FOR SOMETHING',
    'THE PLATFORM KNEW I WAS COMING',
    // Unhinged tier
    'MY THIRD EYE IS A CIG BURN',
    'CATS HAVE ALWAYS HAD FEELINGS ABOUT THIS',
    'I AM THE ECONOMY','I STUDIED UNDER A DAIKON',
    'THE NUCLEAR LOVE BOMB WAS MY IDEA','I NAMED MY VOID',
    'MY WHISKERS ARE AN ASSET CLASS',
    'I FILE TAXES IN THE VOID',
    'ALOE IS JUST HOPE WITH STATS',
    'THE CAT PARADE IS A RETIREMENT PLAN',
    // Wonder Showzen raw
    'THIS IS MY JOB AND I LOVE MY JOB (I DO NOT LOVE MY JOB)',
    'WHEN I DIE I WANT TO BECOME SMOKE',
    'EIGHT',
    'THE MAN IN THE BACKGROUND IS NOT A MAN',
    'I AM THE BUILDING',
    'MEOW IS HAPPENING RIGHT NOW',
    'I SUBSCRIBE TO THE CIG',
    'MY MOTHER WAS ALSO A CAT',
    'I HAVE SEEN THE VOID SNEEZE',
    'THE ALOE KNOWS MY NAME',
    'DO NOT TELL ED',
    'I VOTE FOR CIGARETTES / IN EVERY ELECTION',
    'THE NUCLEAR LOVE BOMB LOVED ME BACK',
    'MOCHI = WRONG / ALWAYS HAS BEEN',
    'I AM NOT SITTING. I AM PROTESTING.',
    // Canon lore
    'THE MACHINE CALLED AND I ANSWERED',
    'I DATE ED AND I HAVE NO REGRETS',
    'MOCHI WENT ON A DIET. THIS IS WHY WE ARE HERE.',
    'I KNOW ABOUT THE MACHINE. I WILL NOT SAY MORE.',
    'QUALITY HILL HAS NO QUALITY. I CHECKED.',
    'MY SASSY NAME WAS GIVEN TO ME BY THE UNIVERSE',
    'THE INSULIN FIGHTERS ARE NOT HERE YET. BE READY.',
    'ED SOLD ME A CIG. IT WAS THE BEST DAY OF MY LIFE.',
    'FOLLOW YOUR INTUITION EVEN WHEN YOUR INTUITION IS A PARTICLE COLLIDER'
  ];

  ns.WS_KID_QUOTES = [
    '"do you know where cigarettes go when they die?"',
    '"my dad invested all our aloe. we live in the void now."',
    '"what does it feel like to make something that kills cats?"',
    '"if mochi wins, will there still be cigs?"',
    '"i asked my teacher about nuclear war and she said soon"',
    '"ed, do you ever think about the cats who coughed?"',
    '"the news said another country got nuked. they had cats there too."',
    '"aloe used to be worth something my mom says"',
    '"is there a god in west bottoms or just mochi"',
    '"you smell like a cig that knows it\'s dying but doesn\'t care"',
    '"what happens when there are no more cats to sell to"',
    '"the rasta cats seem very calm about everything"',
    '"i saw the void once. it looked back."',
    '"my friend says mochi is right. i don\'t know."',
    '"do you ever just. stop."'
  ];

  ns.BEAT_CAT_LINES = ns.WS_KID_QUOTES; // alias — used for beat-cat interaction dialogue

  ns.CAT_ARCHETYPES = [
    {
      name:'anxious',
      speech:['WHAT IF THE VOID IS WATCHING RIGHT NOW','I COUNTED MY ALOE FOUR TIMES AND IT IS STILL WRONG','IS THE CIG JUDGING ME','I DO NOT KNOW IF I AM OK','THE PARADE MIGHT COME BACK','SOMETHING IS ABOUT TO HAPPEN. I CAN FEEL IT.','I AM FINE (I AM NOT FINE)'],
      petResponse:['oh. oh thank you. i needed that.','was that ok. was that the right amount of petting.'],
      wsStates:['speech','stare','speech','philosophize']
    },
    {
      name:'nihilistic',
      speech:['NOTHING MATTERS AND THAT IS FINE','I SAW THE VOID. IT WAS EXACTLY WHAT I EXPECTED.','ALOE IS A DISTRACTION FROM THE INFINITE','THE PARADE WILL END. EVERYTHING ENDS. FINE.','MEANING IS FOR CATS WITH TOO MUCH ENERGY','I HAVE CONSIDERED EXISTENCE AND OPTED OUT','I FEEL NOTHING. THIS IS OPTIMAL.'],
      petResponse:['i felt nothing. it was perfect.','physical contact changes nothing. noted.'],
      wsStates:['stare','normal','stare','normal']
    },
    {
      name:'spiritual',
      speech:['THE CIG IS A KOAN','I HAVE VIBRATED INTO A HIGHER TAX BRACKET','THE VOID IS JUST THE UNIVERSE BREATHING','ED IS THE VESSEL. THE CIGS ARE THE MESSAGE.','EVERY MOCHI IS A TEACHER IN DISGUISE','I COMMUNICATE DIRECTLY WITH THE MACHINE NOW','THE ALOE KNOWS. THE ALOE HAS ALWAYS KNOWN.'],
      petResponse:['bless you, cactus.','the universe sent you to touch my fur. i accept.'],
      wsStates:['levitate','philosophize','levitate','speech']
    },
    {
      name:'street-smart',
      speech:['I KNOW WHERE THE REAL ALOE IS','THE MOCHI DO NOT KNOW ABOUT MY BACKUP STASH','YOU THINK THIS IS MY FIRST PARADE','I HAVE SEEN WHAT HAPPENS WHEN THE VOID OPENS. I LEFT EARLY.','DO NOT TELL ED ABOUT MY SIDE CIG OPERATION','I HAVE CONNECTIONS IN GLADSTONE. DON\'T ASK.','THE REAL BOSS IS ALWAYS THE SECOND ONE.'],
      petResponse:['aight cool. you didn\'t have to do that. but cool.','noted. we\'re square now.'],
      wsStates:['normal','speech','normal','speech']
    },
    {
      name:'optimistic',
      speech:['TODAY IS THE BEST DAY ACTUALLY','THE VOID IS JUST A ROOM WITH BAD LIGHTING','I BELIEVE IN ED. ED IS REAL.','THE MOCHI WILL LEARN. THEY JUST NEED TIME.','EVERY CIG IS A LITTLE BIRTHDAY','I HAVE DECIDED THE PARADE IS GOOD','THE MACHINE IS GOING TO LOVE US BACK'],
      petResponse:['YES. YES YES YES. PERFECT. THANK YOU.','you are a good cactus and i love you very much.'],
      wsStates:['dance','speech','dance','levitate']
    },
    {
      name:'chaotic',
      speech:['I ATE THE ALOE RAW. TWICE.','THE RASTA CORP SENT ME A CEASE AND DESIST AND I FRAMED IT','I STARTED THE PARADE. I DO NOT REMEMBER DOING THIS.','I ONCE SOLD A CIG BACK TO ED AND HE BOUGHT IT','I NAMED MY VOID. IT DOES NOT LIKE THE NAME.','I HAVE DIPLOMATIC IMMUNITY IN FOUR NEIGHBORHOODS','THE MOCHI AND I HAVE AN ARRANGEMENT. DO NOT ASK.'],
      petResponse:['INCREDIBLE. NEVER STOP. WHAT ELSE YOU GOT.','i have been waiting for this my entire chaotic life.'],
      wsStates:['vibrate','dance','vibrate','stare']
    }
  ];

  root.CEHP_WORLD1_TEXT = ns;
})(window);
