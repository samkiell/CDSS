/**
 * FINAL TEST NORMALIZATION SCRIPT
 * ================================
 * Creates properly formatted tests arrays for all conditions based on DOCX source data.
 * This script uses a hardcoded mapping of conditions to tests based on the DOCX documents.
 */

const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(process.cwd(), 'public', 'rules');

// ============================================================================
// CERVICAL REGION TESTS (from Cervical Region.docx)
// ============================================================================
const CERVICAL_TESTS = {
  "Cervical Disc Herniation": [
    {
      "name": "Spurling's Test (Maximal Cervical Compression and Foraminal Compression Test)",
      "procedure": "The neck is placed in extension, lateral flexion, and axial compression. The test is positive if pain is present and radiates to the arm."
    },
    {
      "name": "Cervical Distraction Test",
      "procedure": "The patient lies supine and the neck is positioned comfortably. The examiner places hand around the patient's mastoid process. The examiner then slightly flexes the patient's neck and pulls the head towards your torso. Test is positive if the symptoms reduce or are eliminated with traction."
    },
    {
      "name": "MRI",
      "procedure": "Radiographic confirmation of disc herniation"
    },
    {
      "name": "Clinical Observation - Cervical Rotation",
      "procedure": "Check if cervical rotation on the affected side is less than 60 degrees"
    }
  ],
  "Cervical Spondylosis": [
    {
      "name": "Spurling's Test (Maximal Cervical Compression and Foraminal Compression Test)",
      "procedure": "The neck is placed in extension, lateral flexion, and axial compression. The test is positive if pain is present and radiates to the arm."
    },
    {
      "name": "Radiographic Confirmation",
      "procedure": "Check for loss of normal cervical lordosis, and degeneration"
    }
  ]
};

// ============================================================================
// LUMBAR REGION TESTS (from Lumbar Region.docx)
// ============================================================================
const LUMBAR_TESTS = {
  "Non-specific low-back pain": [
    {
      "name": "Lasègue's Test (Straight-Leg Raise)",
      "procedure": "Examiner raises legs of patient up so that hip flexion is achieved while knee is extended. Test is positive if patient feels pain along the course of the sciatic nerve and below the knee when hip is between 30-70 degrees of flexion."
    },
    {
      "name": "Bragard Test",
      "procedure": "This is a modification of the SLR and dorsiflexion is applied at the end of the SLR. This reduces the angle where the test is positive."
    }
  ],
  "Sciatica": [
    {
      "name": "Lasègue's Test (Straight-Leg Raise)",
      "procedure": "Examiner raises legs of patient up so that hip flexion is achieved while knee is extended. Test is positive if patient feels pain along the course of the sciatic nerve and below the knee when hip is between 30-70 degrees of flexion."
    },
    {
      "name": "Bragard Test",
      "procedure": "This is a modification of the SLR and dorsiflexion is applied at the end of the SLR. This reduces the angle where the test is positive."
    },
    {
      "name": "Bowstring Test (Popliteal Compression Test / Tibial Nerve Stretch Sign)",
      "procedure": "This can be done while patient is lying in supine or sitting position. The examiner flexes the knee and applies pressure on the popliteal fossa evoking sciatica."
    },
    {
      "name": "Clinical Observation - Knee Jerk Reflex",
      "procedure": "Check if knee jerk reflex is present"
    },
    {
      "name": "Clinical Observation - Ankle Jerk Reflex",
      "procedure": "Check if ankle jerk reflex is present"
    }
  ],
  "Lumbar spinal stenosis": [
    {
      "name": "Bicycle Stress Test",
      "procedure": "Record the amount of time the patient spends on a cycle ergometer while in a neutral lumbar position and slumped position. If patient spends more time in the slumped position, a lumbar spinal stenosis is indicated."
    },
    {
      "name": "Two-stage Treadmill Test",
      "procedure": "The patient walks on a flat treadmill and the amount of time spent is recorded and compared with the amount of time while the treadmill is inclined such that patient walks in flexion."
    },
    {
      "name": "Lumbar Extension-Loading Test",
      "procedure": "The examiner ensures that the lumbar region is in moderate extension (10-30 deg) while standing and patient lies supine. Check if there are changes in the symptoms that the patient feels."
    },
    {
      "name": "Clinical Observation - Wide-based Gait",
      "procedure": "Check if a wide-based gait is present"
    },
    {
      "name": "Clinical Observation - Trendelenburg's Sign",
      "procedure": "Check if Trendelenburg's sign is present"
    },
    {
      "name": "Clinical Observation - Romberg Test",
      "procedure": "Check for negative Romberg test"
    },
    {
      "name": "Clinical Observation - Achilles Reflex",
      "procedure": "Check if Achilles tendon reflex is diminished"
    }
  ],
  "Lumbar Disc Herniation": [
    {
      "name": "Lasègue's Test (Straight-Leg Raise)",
      "procedure": "Examiner raises legs of patient up so that hip flexion is achieved while knee is extended. Test is positive if patient feels pain along the course of the sciatic nerve and below the knee when hip is between 30-70 degrees of flexion."
    },
    {
      "name": "Bragard Test",
      "procedure": "This is a modification of the SLR and dorsiflexion is applied at the end of the SLR. This reduces the angle where the test is positive."
    },
    {
      "name": "Bowstring Test (Popliteal Compression Test / Tibial Nerve Stretch Sign)",
      "procedure": "This can be done while patient is lying in supine or sitting position. The examiner flexes the knee and applies pressure on the popliteal fossa evoking sciatica."
    },
    {
      "name": "Femoral Nerve Stretch Test (Wasserman Sign)",
      "procedure": "Patient is in prone position, knee is flexed and hip is extended. Reproduction of pain in anterior thigh is positive."
    },
    {
      "name": "Kernig Test",
      "procedure": "Patient's neck is flexed, hip flexed and the leg is extended. Pain is reproduced in this position."
    },
    {
      "name": "Milgram Test",
      "procedure": "Pain is reproduced on straight leg elevation for 30 seconds."
    },
    {
      "name": "MRI",
      "procedure": "Radiographic confirmation of disc herniation"
    },
    {
      "name": "Clinical Observation - Paraspinal Tenderness",
      "procedure": "Check for tenderness in the paraspinal musculature"
    },
    {
      "name": "Clinical Observation - Paraspinal Spasms",
      "procedure": "Check for spasms in the paraspinal musculature"
    },
    {
      "name": "Clinical Observation - Decreased Reflexes",
      "procedure": "Check for decreased reflexes: patellar and ankle jerk"
    },
    {
      "name": "Clinical Observation - Trendelenburg's Sign",
      "procedure": "Check for Trendelenburg's sign"
    }
  ],
  "Cauda Equina Syndrome": [
    {
      "name": "MRI",
      "procedure": "Radiographic confirmation - urgent imaging required"
    },
    {
      "name": "Clinical Observation - Upper Motor Neuron Signs",
      "procedure": "Check for Babinski sign and clonus to rule out upper motor neuron involvement"
    }
  ],
  "Axial spondyloarthropathy": [
    {
      "name": "Lateral Lumbar Flexion (Fingertip to Floor Test)",
      "procedure": "The patient stands with heel touching wall and feet wide apart, and back against the wall. Then the examiner measures the distance from middle finger to the floor. Then patient bends to side (lateral flexion). The distance between the middle finger and the floor is measured again. This measurement is done for both sides."
    },
    {
      "name": "Modified Schober's Test",
      "procedure": "Examiner marks both posterior superior iliac spine, and a horizontal line is drawn between both marks. A second line is marked 5cm below the first line, and a third line is marked 10cm above the first line. Patient is then instructed to flex forward as if attempting to touch their toes. An increase of less than 5cm shows decreased lumbar spine range of motion, and ankylosing spondylitis."
    },
    {
      "name": "Chest Expansion Test",
      "procedure": "Normal chest expansion is ≥ 5 cm"
    },
    {
      "name": "Occiput to Wall Distance",
      "procedure": "Normal distance is 0"
    },
    {
      "name": "Tragus to Wall Distance",
      "procedure": "Normal distance is < 15cm"
    },
    {
      "name": "Intermalleolar Distance",
      "procedure": "Normal distance is > 100cm"
    },
    {
      "name": "Laboratory Investigations",
      "procedure": "Confirmatory test through laboratory investigations (HLA-B27, ESR, CRP)"
    }
  ]
};

// ============================================================================
// ANKLE REGION TESTS (from Ankle Region.docx)
// ============================================================================
const ANKLE_TESTS = {
  "General Assessment": [
    {
      "name": "Clinical Assessment",
      "procedure": "Physical examination and clinical assessment based on presenting symptoms"
    }
  ],
  "Achilles Tendinopathy": [
    {
      "name": "Ultrasound",
      "procedure": "Use ultrasound to investigate tears"
    },
    {
      "name": "Radiographic Confirmation",
      "procedure": "Imaging to confirm diagnosis"
    }
  ],
  "Achilles Tendon Rupture": [
    {
      "name": "Thompson's Test (Simmond's Test)",
      "procedure": "Patient lies prone and the calf is squeezed. If tendon is ruptured, the foot will remain still when it ought to contract involuntarily."
    },
    {
      "name": "Clinical Observation - Plantarflexion Weakness",
      "procedure": "Check if plantarflexion of the ankle is weak"
    },
    {
      "name": "Clinical Observation - Palpable Gap",
      "procedure": "Check for palpable gap at the site of the rupture"
    },
    {
      "name": "Ultrasound",
      "procedure": "Use ultrasound to confirm the diagnosis"
    }
  ],
  "Traction Apophysitis (Sever's Disease)": [
    {
      "name": "Radiographic Confirmation",
      "procedure": "Check for density of apophysitis and check for fragmentation of the apophysitis"
    }
  ],
  "Calcaneal Bursitis": [
    {
      "name": "Clinical Observation - Posterior Calcaneum",
      "procedure": "Check if the posterior portion of the calcaneum looks more prominent"
    }
  ],
  "Plantar Fasciitis": [
    {
      "name": "Ultrasound",
      "procedure": "Confirmation using ultrasound to check for thickening around the heel"
    },
    {
      "name": "Doppler Test",
      "procedure": "Doppler test to show increased local blood flow and neovascularisation"
    }
  ],
  "Acute Injury of Lateral Ligaments": [
    {
      "name": "Clinical Observation - Palpation",
      "procedure": "Palpate the ankle distally and anteriorly to the lateral malleolus and ask if patient feels more pain. Usually, patient feels more pain on palpation."
    },
    {
      "name": "Radiographic Confirmation",
      "procedure": "Rule out undisplaced fracture of fibula, tarsal bone, 5th metatarsal bone"
    }
  ],
  "Recurrent Lateral Instability": [
    {
      "name": "Talar Tilt Test",
      "procedure": "The ankle is held in the neutral position, examiner stabilises the tibia just above the ankle and then tries to force the ankle into maximum inversion. The ROM can be measured or compared with the contralateral side. Inversion laxity suggests injury to calcaneofibular and anterior talofibular ligaments (ATFL)."
    },
    {
      "name": "Anterior Drawer Test",
      "procedure": "Patient sits with knee flexed at 90 deg and ankle in plantarflexion of about 10 deg. The lower leg is stabilised by the examiner and forces patient's heel forward over the tibia. If positive, the talus can be felt sliding forwards and backwards. Laxity indicates tear of the ATFL."
    }
  ],
  "Deltoid Ligament Tear": [
    {
      "name": "Clinical Observation - Foot Position",
      "procedure": "Check if foot is everted and externally rotated"
    },
    {
      "name": "Radiographic Confirmation",
      "procedure": "Check for widening of the medial joint space in the mortise view, check if talus is tilted, check for fracture or dislocation of the proximal fibula"
    }
  ],
  "Tears of Inferior Tibiofibular Ligaments": [
    {
      "name": "Squeeze Test",
      "procedure": "Compress the leg firmly above the ankle. Test is positive if pain is felt over the syndesmosis."
    }
  ],
  "Malleolar Fractures": [
    {
      "name": "Radiographic Confirmation",
      "procedure": "Confirm fracture using radiographic imaging"
    }
  ],
  "Calcaneal Fractures": [
    {
      "name": "Radiographic Confirmation",
      "procedure": "X-ray imaging to confirm fracture"
    },
    {
      "name": "Clinical Assessment - Foot Compartment Syndrome",
      "procedure": "Rule out foot compartment syndrome"
    }
  ],
  "Foot Compartment Syndrome": [
    {
      "name": "Clinical Observation - Two-point Discrimination",
      "procedure": "Check if two-point discrimination is present"
    },
    {
      "name": "Clinical Observation - Passive Movement Pain",
      "procedure": "Check if pain is present on passive movement of the toes"
    },
    {
      "name": "Laboratory Confirmation",
      "procedure": "Refer for laboratory confirmation"
    }
  ],
  "Rheumatoid Arthritis (Forefoot)": [
    {
      "name": "Clinical Observation - Deformities",
      "procedure": "Check for the following deformities: flattened anterior arch, hallux valgus, claw toes, prominence of the metatarsal head in the soles (feels like walking on stones), presence of subcutaneous nodules"
    },
    {
      "name": "Radiographic Confirmation",
      "procedure": "Check for osteoporosis and periarticular erosion at the metatarsophalangeal joint"
    }
  ],
  "Rheumatoid Arthritis (Ankle and Hindfoot)": [
    {
      "name": "Radiographic Confirmation",
      "procedure": "Check for osteoporosis, erosion of the tarsal and ankle joints and the swelling of soft-tissues"
    }
  ],
  "Osteoarthritis (Ankle)": [
    {
      "name": "Clinical Observation - Osteophytes",
      "procedure": "Check if palpable anterior osteophytes are present at the ankle joint"
    },
    {
      "name": "Clinical Observation - Anterior Joint Line",
      "procedure": "Check if tenderness is present along the anterior joint line"
    },
    {
      "name": "Clinical Observation - Gait",
      "procedure": "Check for antalgic gait and outward turning of the foot as patient walks"
    },
    {
      "name": "Radiographic Confirmation",
      "procedure": "Check for joint space narrowing, osteophyte formation, subchondral sclerosis, and cyst formation"
    }
  ],
  "Tarsal Tunnel Syndrome": [
    {
      "name": "Tinel's Sign",
      "procedure": "Percussion of the tarsal tunnel. Positive if this results in a distal radiation of paraesthesia."
    },
    {
      "name": "Dorsiflexion-Eversion Test",
      "procedure": "Place the patient's foot into dorsiflexion and eversion and hold for 5-10 seconds. Positive if patient's symptom is elicited."
    },
    {
      "name": "Clinical Observation - Abductor Hallucis",
      "procedure": "Check for atrophy of the abductor hallucis"
    },
    {
      "name": "Clinical Observation - Arch Stability",
      "procedure": "Check for arch stability"
    },
    {
      "name": "Clinical Observation - Talus and Calcaneus Position",
      "procedure": "Check for the position of the talus and calcaneus"
    }
  ]
};

// ============================================================================
// SHOULDER REGION TESTS (from Shoulder Region.docx)
// ============================================================================
const SHOULDER_TESTS = {
  "Initial Assessment": [
    {
      "name": "Radiographic Confirmation",
      "procedure": "X-ray to check for fracture location and displacement"
    }
  ],
  "Shoulder Impingement Syndrome": [
    {
      "name": "Spurling's Test (for Cervical Radiculitis)",
      "procedure": "While patient is seated, the examiner applies side flexion of the neck towards the affected side while applying axial compression. Sign is positive if the pain sensation felt in the shoulder-neck region is replicated."
    },
    {
      "name": "Painful Arc Test",
      "procedure": "Ask patient to abduct arm across range of motion actively. Scapular rhythm is disturbed, pain is aggravated between 60-120 degrees, pain is alleviated if shoulder is laterally rotated on abduction. If positive, SIS is indicated."
    },
    {
      "name": "Neer Impingement Sign",
      "procedure": "Stabilise the scapula with one hand and raise the unaffected side to full flexion with abduction and internal rotation passively. The test is positive when there is pain at the subacromial space."
    },
    {
      "name": "Hawkins-Kennedy Test",
      "procedure": "Patient arm is placed in 90 deg of elevation at the scapular level and 90 deg flexion. Stabilise the upper arm with one hand and internally rotate with the other hand. The test is positive when pain is felt in the anterolateral aspect of the shoulder."
    },
    {
      "name": "Jobe's Test",
      "procedure": "Elevate arm in scapular plane, extend elbow and thumb points towards floor with arm internally rotated. Patient is asked to hold the position with downward pressure from examiner. Positive sign = pain on examiner restriction indicating supraspinatus irritation."
    }
  ],
  "Subacute tendinitis OR Painful arc syndrome": [
    {
      "name": "Painful Arc Test",
      "procedure": "Ask patient to abduct arm across range of motion actively. Check for pain between 60-120 degrees."
    },
    {
      "name": "Clinical Observation - Acromion Palpation",
      "procedure": "Palpate the anterior edge of the acromion with the arm in extension and flexion. Subacute tendinitis is indicated if pain is present."
    }
  ],
  "Chronic Tendinitis": [
    {
      "name": "Clinical Observation - Bicipital Groove",
      "procedure": "Check for tenderness along the bicipital groove or on moving the biceps tendon (bicipital tendinitis can co-exist with other rotator cuff pathologies)"
    }
  ],
  "Cuff Disruption": [
    {
      "name": "Empty Can Test (Supraspinatus)",
      "procedure": "Patient is asked to abduct up to 90 deg, 30 deg flexion and internal rotation. Examiner stands behind patient and applies downward pressure. Positive sign: affected side is weaker than unaffected side. Positive sign suggests tear in the supraspinatus."
    },
    {
      "name": "Infraspinatus Test",
      "procedure": "Patient holds arms close to body, elbow is flexed up to 90 deg of forward elevation in scapular plane. External rotation is instructed while examiner applies resistance. Lack of power on one side indicates weakness of the infraspinatus muscle."
    },
    {
      "name": "Subscapularis Test (Belly Press Test)",
      "procedure": "Patient is asked to place their hand on their abdomen and move elbow forward. Patient is then asked to press hand on the abdomen. If subscapularis is torn, patient will be unable to perform movement and elbow will move backwards."
    },
    {
      "name": "Lag Sign for External Rotation",
      "procedure": "Patient lifts arm slightly from body and is asked to hold in external rotation. Positive when hand recoils to neutral position and suggests tear of infraspinatus or supraspinatus."
    },
    {
      "name": "Drop Sign",
      "procedure": "The examiner places the arm at 90 deg abduction, elbow at right angle and arm maximally rotated. Positive sign: arm drops from position. Suggests a tear of the infraspinatus or the posterior part of the rotator cuff."
    },
    {
      "name": "Lift-Off Test (Subscapularis)",
      "procedure": "Patient is asked to place hand on the back at the mid-lumbar spine. The therapist then lifts hand from the back and patient is asked to hold it there. Positive sign: inability to maintain hand while removed suggests subscapularis weakness."
    }
  ],
  "Calcific Tendinitis": [
    {
      "name": "X-ray",
      "procedure": "Check X-ray to rule out asymptomatic calcification"
    }
  ],
  "Bicipital Tendinitis": [
    {
      "name": "Speed Test",
      "procedure": "Place patient's arm in shoulder flexion, forearm supination and elbow extension. The examiner then applies pressure to the arm as downward action. A positive sign: pain in the bicipital grove is replicable."
    },
    {
      "name": "Yergason's Test",
      "procedure": "Patient places the forearm in the supine position, and the examiner applies resistance against supination. A positive sign: this replicates the pain in the bicipital group tenderness."
    }
  ],
  "Rupture of the Biceps Tendon": [
    {
      "name": "Clinical Observation - Lump",
      "procedure": "Ask patient to lift or offer resistance to biceps contraction. Check if a prominent lump is seen in lower arm."
    },
    {
      "name": "Clinical Observation - Bruising",
      "procedure": "Check if the upper arm becomes painful and bruised"
    }
  ],
  "Hourglass Biceps": [
    {
      "name": "Clinical Observation - Buckling",
      "procedure": "Ask patient to elevate the shoulder. Check if buckling of tendon is present."
    }
  ],
  "SLAP Lesion": [
    {
      "name": "O'Brien's Test",
      "procedure": "Instruct the patient to flex the arm up to 90 deg with the elbow in full extension. Then ask patient to adduct arm 10-15 deg medial to sagittal plane. Arm is maximally internally rotated and examiner applies downward pressure while patient is asked to resist. Procedure is then repeated in supination. Positive: Pain is elicited by the first manoeuvre, and is reduced or eliminated by the second."
    }
  ],
  "Adhesive Capsulitis (Frozen Shoulder)": [
    {
      "name": "Range of Motion Assessment",
      "procedure": "Check if the active range of motion and passive range of motion is full across shoulder joints. Active and passive range of motion is limited in Adhesive Capsulitis."
    },
    {
      "name": "Imaging",
      "procedure": "Rule out other causes of stiffness with imaging"
    }
  ],
  "Recurrent Shoulder Subluxation": [
    {
      "name": "Apprehension Test",
      "procedure": "Patient is in sitting or lying position, the examiner lifts the arm gently into abduction, external rotation and then extension. Test is positive if patient senses that humeral head is about to slip out anteriorly and body stiffens in apprehension. The test is repeated with the anterior part of shoulder protected."
    },
    {
      "name": "Fulcrum's Test",
      "procedure": "Patient lies supine, arm abducted up to 90 deg. The examiner places their hands over the shoulder to set the fulcrum base. The humeral head is levered forward by extending and externally rotating arm. The patient immediately becomes apprehensive."
    },
    {
      "name": "Drawer's Test",
      "procedure": "Patient lies supine, scapula is stabilised with one hand while the upper arm is grasped firmly with the other, and manoeuvring is done forward and backward (like a drawer). The drawer's test is positive if instability is marked."
    }
  ],
  "Rheumatoid Arthritis (Shoulder)": [
    {
      "name": "Radiographic Confirmation",
      "procedure": "Check for periarticular erosions, subchondral sclerosis, and resorption"
    }
  ],
  "Osteoarthritis (Shoulder)": [
    {
      "name": "Radiographic Confirmation",
      "procedure": "Check for distortion of the joint, subchondral sclerosis, osteophyte formation, and narrowing of articular space"
    }
  ]
};

// ============================================================================
// ELBOW REGION TESTS (from Elbow Region.docx)
// ============================================================================
const ELBOW_TESTS = {
  "Lateral Elbow Tendinopathy": [
    {
      "name": "Maudsley's Test",
      "procedure": "Resisted extension of the middle finger elicits pain"
    },
    {
      "name": "Cozen's Test",
      "procedure": "Pain on resisted wrist extension"
    },
    {
      "name": "Mill's Sign",
      "procedure": "Patient closes hands, dorsiflexes wrist and elbow is extended. The examiner then forces the wrist into palmar flexion against resistance. Pain in the epicondyle is positive."
    },
    {
      "name": "Clinical Observation - Lateral Epicondyle Palpation",
      "procedure": "Check if palpation of the lateral epicondyle is painful"
    }
  ],
  "Medial Epicondylitis (Golfer's Elbow)": [
    {
      "name": "Resisted Forearm Pronation Test",
      "procedure": "The patient resists forearm pronation with the forearm in extension. The test is positive if pain is elicited."
    },
    {
      "name": "Resisted Wrist Flexion Test",
      "procedure": "Patient resists wrist flexion with the forearm in extension and supination (i.e. therapist resists wrist extension with the forearm in extension and supination). The test is positive if pain is elicited."
    }
  ],
  "Ulnar Nerve Entrapment": [
    {
      "name": "Clinical Observation - Hand Muscle Bulk",
      "procedure": "Check if muscle bulk in hand is normal (extreme cases may include atrophy)"
    }
  ],
  "Medial Ligament Injury": [
    {
      "name": "Valgus Stress Test",
      "procedure": "Place forearm in supine position, flex elbow up till about 30 deg. Palpate MCL and apply lateral pressure (abduction). Positive test: increased laxity of MCL and pain."
    }
  ],
  "Distal Biceps Tendinopathy": [
    {
      "name": "Resisted Forearm Supination Test",
      "procedure": "Check if pain is present on resisted forearm supination. Pain indicates the presence of a biceps tendinopathy."
    }
  ],
  "Avulsion of the Distal Biceps Tendon": [
    {
      "name": "O'Driscoll's Hook Test",
      "procedure": "Palpate for biceps tendon in the antecubital fossa with arms flexed, shoulder abducted and forearm in supination. Test is positive if the biceps tendon cannot be hooked."
    }
  ],
  "Olecranon Bursitis": [
    {
      "name": "Clinical Observation - Olecranon Engorgement",
      "procedure": "Check if olecranon region is engorged"
    }
  ],
  "Rheumatoid Arthritis (Elbow)": [
    {
      "name": "Radiographic Confirmation",
      "procedure": "Check for osteopenia, bone erosions, destruction of the radial head and widening of the sigmoid notch"
    },
    {
      "name": "Laboratory Tests",
      "procedure": "Other laboratory tests as may be necessary (RF, anti-CCP, ESR, CRP)"
    }
  ],
  "Osteoarthritis (Elbow)": [
    {
      "name": "Radiographic Confirmation",
      "procedure": "Check for joint space narrowing, osteophyte formation, and subchondral sclerosis"
    }
  ]
};

// All test mappings
const ALL_TESTS = {
  cervical: CERVICAL_TESTS,
  lumbar: LUMBAR_TESTS,
  ankle: ANKLE_TESTS,
  shoulder: SHOULDER_TESTS,
  elbow: ELBOW_TESTS
};

/**
 * Find tests for a condition by matching names
 */
function findTestsForCondition(conditionName, regionTests) {
  // Exact match
  if (regionTests[conditionName]) {
    return regionTests[conditionName];
  }
  
  // Case-insensitive match
  const lowerName = conditionName.toLowerCase();
  for (const [key, tests] of Object.entries(regionTests)) {
    if (key.toLowerCase() === lowerName) {
      return tests;
    }
  }
  
  // Partial match
  for (const [key, tests] of Object.entries(regionTests)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return tests;
    }
  }
  
  // Handle variations
  const variations = {
    'RHEUMATOID ARTHRITIS': 'Rheumatoid Arthritis',
    'OSTEOARTHRITIS': 'Osteoarthritis',
    'General Assessment': 'General Assessment',
    'ANKLE LIGAMENT INJURIES': 'Acute Injury of Lateral Ligaments',
    'MALLEOLAR FRACTURES OF THE ANKLE': 'Malleolar Fractures',
    'CALCANEAL FRACTURES': 'Calcaneal Fractures',
    'RA of Ankle and Hindfoot': 'Rheumatoid Arthritis (Ankle and Hindfoot)',
    'CALCIFIC TENDINITIS': 'Calcific Tendinitis',
    'RECURRENT SHOULDER SUBLUXATION': 'Recurrent Shoulder Subluxation'
  };
  
  if (variations[conditionName] && regionTests[variations[conditionName]]) {
    return regionTests[variations[conditionName]];
  }
  
  return null;
}

/**
 * Process a single JSON file
 */
function processRuleFile(jsonPath) {
  const filename = path.basename(jsonPath);
  console.log(`\nProcessing: ${filename}`);
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  if (!data.conditions || data.conditions.length === 0) {
    console.log('  No conditions found, skipping...');
    return null;
  }
  
  const region = data.region;
  const regionTests = ALL_TESTS[region];
  
  if (!regionTests) {
    console.log(`  No test mapping found for region: ${region}`);
    return null;
  }
  
  let totalTests = 0;
  
  for (const condition of data.conditions) {
    // Find tests for this condition
    let tests = findTestsForCondition(condition.name, regionTests);
    
    if (!tests || tests.length === 0) {
      // Default test if none found
      tests = [{
        name: "Clinical Assessment",
        procedure: "Physical examination and clinical assessment based on presenting symptoms"
      }];
    }
    
    condition.tests = tests;
    totalTests += tests.length;
    
    // Clean up old fields
    delete condition.recommended_tests;
    delete condition.confirmation_methods;
    delete condition.observations;
    
    console.log(`  ${condition.name}: ${tests.length} tests`);
  }
  
  // Clean up
  delete data.raw_text;
  delete data.extraction_messages;
  
  // Update metadata
  data.version = '2.0.0';
  data.extracted_at = new Date().toISOString();
  
  // Write file
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  
  return {
    file: filename,
    conditions: data.conditions.length,
    totalTests: totalTests
  };
}

/**
 * Main function
 */
async function normalizeAllTests() {
  console.log('='.repeat(60));
  console.log('FINAL TEST NORMALIZATION');
  console.log('='.repeat(60));
  console.log(`Rules directory: ${RULES_DIR}`);
  
  const files = fs.readdirSync(RULES_DIR);
  const jsonFiles = files.filter(f => 
    f.endsWith('.json') && 
    !f.includes('index') && 
    !f.includes('clinical-tests')
  );
  
  console.log(`Found ${jsonFiles.length} rule files`);
  
  const results = [];
  
  for (const jsonFile of jsonFiles) {
    const fullPath = path.join(RULES_DIR, jsonFile);
    const result = processRuleFile(fullPath);
    if (result) {
      results.push(result);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('NORMALIZATION COMPLETE');
  console.log('='.repeat(60));
  
  let grandTotal = 0;
  for (const r of results) {
    console.log(`${r.file}: ${r.conditions} conditions, ${r.totalTests} tests`);
    grandTotal += r.totalTests;
  }
  console.log(`\nGrand total: ${grandTotal} tests across all conditions`);
}

// Run
if (require.main === module) {
  normalizeAllTests().catch(console.error);
}

module.exports = { normalizeAllTests };
