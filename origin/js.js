const blocks = {
  // 각 블록에는 전환했을때 표시할 4개 블록
  tree: [
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [2, 1],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 1],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
    [
      [0, 1],
      [1, 2],
      [1, 1],
      [1, 0],
    ],
  ],
  squre: [
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
  ],
  bar: [
    [
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ],
    [
      [2, -1],
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    [
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ],
    [
      [2, -1],
      [2, 0],
      [2, 1],
      [2, 2],
    ],
  ],
  zee: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 1],
      [1, 0],
      [1, 1],
      [0, 2],
    ],
    [
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [1, 1],
      [1, 2],
    ],
  ],
  elLeft: [
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [0, 0],
    ],
    [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
  ],
  elRight: [
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
      [1, 2],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [1, 2],
    ],
  ],
};

// DOM
const start = document.querySelector('.tetris_board>ul');
const gameEnd = document.querySelector('.gameEnd');
const gameStart = document.querySelector('.gameStart');
const StartBtn = document.querySelector('.startBtn');
const reStartBtn = document.querySelector('.restartBtn');
const scoreDisplay = document.querySelector('.score');

//Start Setting
const tetris_cols = 10; // 가로 개수
const tetris_rows = 20; // 세로 개수

//variables
let score = 0;
let speed = 500;
let downInterval;
let temp_block;

const move_item = {
  type: 'tree', //블록 타입
  direction: 0, //위 화살표를 눌렀을때 방향 전환
  location_top: 0, //블록의 위치 x값 0~9
  location_left: 3, //블록의 위치 y값 0~19
};

//functions
function init() {
  //https://learnjs.vlpt.us/useful/07-spread-and-rest.html 나중에 다시 보기 spread와 rset 뭔가 좋아보이네
  temp_block = { ...move_item }; //spread 문법으로 변수 내용만 복사해오는 기능제공
  for (let i = 0; i < tetris_rows; i++) {
    prependNewLine();
  }
  generateNewBlock();
}

function prependNewLine() {
  const trans_li = document.createElement('li');
  const bar_ul = document.createElement('ul');

  for (let j = 0; j < tetris_cols; j++) {
    const tetris_block = document.createElement('li');
    bar_ul.prepend(tetris_block);
  }

  trans_li.prepend(bar_ul);
  start.prepend(trans_li);
}

function rendering(moveType = '') {
  //temp_block안의 내용들을 매번 temp_block.type 등으로 접근하기 힘드니 새로 만들어준것임
  //이를 디스럭처링이라고 함, 키값은 순서 상관없이 동일한 변수명에 따라가는데 다른명칭으로 하고싶으면
  //const { lastName: ln, firstName: fn } = user; 처럼 별도의 처리 필요
  const { type, direction, location_top, location_left } = temp_block;
  //이동 효과를 주기 위해 이동 전 블록의 클랙스를 지움
  const movingBlocks = document.querySelectorAll('.moving');

  movingBlocks.forEach((moveing) => {
    moveing.classList.remove(type, 'moving');
  });

  //console.log(blocks[type][direction]);
  // foreEach는 중간에 반복을 중단시킬 수 없기 때문에 some를 사용하면 반복을 중단시킬 수 있다
  blocks[type][direction].some((block) => {
    const x = block[0] + location_left; // x = left값
    const y = block[1] + location_top; // y= top값

    const target = start.childNodes[y]
      ? start.childNodes[y].childNodes[0].childNodes[x]
      : null;

    const isAvailable = checkEmp(target);

    if (isAvailable) {
      target.classList.add(type, 'moving');
    } else {
      temp_block = { ...move_item };

      if (moveType === 'retry') {
        clearInterval(downInterval);
        showGameOverText();
      }

      // 무한 렌더링 방지용인데 왜 이게 방지를 시키는지 좀 더 이해 필요
      setTimeout(() => {
        rendering('retry');
        if (moveType === 'location_top') {
          seizeBlcok();
        }
      }, 0);
      return true;
    }
  });
  move_item.location_left = location_left;
  move_item.location_top = location_top;
  move_item.direction = direction;
}

function checkEmp(target) {
  if (!target || target.classList.contains('seized')) {
    return false;
  }
  return true;
}

function moveBlock(moveType, val) {
  temp_block[moveType] += val;
  rendering(moveType);
}

function moveDirection() {
  const dir = temp_block.direction + 1 < 4 ? temp_block.direction + 1 : 0;
  temp_block.direction = dir;
  rendering();
}

function seizeBlcok() {
  const movingBlocks = document.querySelectorAll('.moving');

  movingBlocks.forEach((moveing) => {
    moveing.classList.remove('moving');
    moveing.classList.add('seized');
  });

  check_match();
}

function check_match() {
  const childNodes = start.childNodes;
  childNodes.forEach((child) => {
    let matched = true;
    child.children[0].childNodes.forEach((li) => {
      if (!li.classList.contains('seized')) {
        matched = false;
      }
    });
    if (matched) {
      child.remove();
      prependNewLine();
      score++;
      scoreDisplay.innerText = score;
    }
  });
  generateNewBlock();
}

function showGameOverText() {
  gameEnd.style.display = 'block';
}

function generateNewBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock('location_top', 1);
  }, speed);

  const blockArray = Object.entries(blocks);
  const randomIndex = Math.floor(Math.random() * blockArray.length);

  move_item.type = blockArray[randomIndex][0];
  move_item.location_top = 0;
  move_item.location_left = 0;
  move_item.direction = 0;
  temp_block = { ...move_item };
  rendering();
}

function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock('location_top', 1);
  }, 10);
}

//event handling
document.addEventListener('keydown', (e) => {
  switch (e.keyCode) {
    case 37: {
      moveBlock('location_left', -1);
      break;
    }
    case 39: {
      moveBlock('location_left', 1);
      break;
    }
    case 38: {
      moveDirection();
      break;
    }
    case 40: {
      moveBlock('location_top', 1);
      break;
    }
    case 32: {
      dropBlock();
    }
    default:
      break;
  }
});

StartBtn.addEventListener('click', () => {
  gameStart.style.display = 'none';

  init();
});

reStartBtn.addEventListener('click', () => {
  start.innerHTML = ''; // 게임판 초기화
  init(); //새로운 게임 시작
  gameEnd.style.display = 'none'; //종료창 제거
});
