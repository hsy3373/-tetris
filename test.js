const blocks = ['one', 'two'];

// DOM
const start = document.querySelector('.tetris_board>ul');
const gameEnd = document.querySelector('.gameEnd');
const gameStart = document.querySelector('.gameStart');
const StartBtn = document.querySelector('.startBtn');
const reStartBtn = document.querySelector('.restartBtn');
const scoreDisplay = document.querySelector('.score');

//Start Setting
const tetris_cols = 8; // 가로 개수
const tetris_rows = 10; // 세로 개수

//variables
let score = 0;
let speed = 500;
let downInterval;
let temp_block;

let checking = false;

const move_item = {
  type: 'a', //블록 타입
  location_top: 0, //블록의 위치 x값 0~9
  location_left: 3, //블록의 위치 y값 0~19
};

//functions
function init() {
  //https://learnjs.vlpt.us/useful/07-spread-and-rest.html 나중에 다시 보기 spread와 rset 뭔가 좋아보이네
  //가장 최초에 무브 아이템 내용으로 temp_block 채워줌
  temp_block = { ...move_item }; //spread 문법으로 변수 내용만 복사해오는 기능제공
  // 설정한 행 개수만큼 열 만드는 함수 돌림
  for (let i = 0; i < tetris_rows; i++) {
    prependNewLine();
  }
  generateNewBlock();
}

// 기본적으로 테트리스 블록 화면의 각 열 구현하는 메서드
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
  const { type, location_top, location_left } = temp_block;

  //이동 효과를 주기 위해 이동 전 블록의 클랙스를 지움
  const movingBlocks = document.querySelectorAll('.moving');
  movingBlocks.forEach((moveing) => {
    moveing.classList.remove(type, 'moving');
  });

  //console.log(blocks[type][direction]);
  // foreEach는 중간에 반복을 중단시킬 수 없기 때문에 some를 사용하면 반복을 중단시킬 수 있다
  // 각 위키 칸별로 이렇게 하려고했던건데 나는 한칸이라 반복을 돌릴 필요ㄴㄴ
  // blocks.some((block) => {
  const x = location_left; // x = left값
  const y = location_top; // y= top값

  // start = 전체 테트리스 행의 부모
  // y = 전체 행중 현재 행
  // x = 현재 좌측으로부터의 위치
  // 만약 현재 행이 있다면 그안에서 현재 위치를 찾고, 현재행이 없다면 null
  const target = start.childNodes[y]
    ? start.childNodes[y].childNodes[0].childNodes[x]
    : null;

  // 타겟요소가 있는지, 타겟요소가 이미 차있는 요소는 아닌지 확인 후 boolean값 반환
  const isAvailable = checkEmp(target);

  if (isAvailable) {
    // 만약 target의 상태가 정상적일때 타겟에 무빙 클래스 추가
    target.classList.add(type, 'moving');
  } else {
    // 타겟의 상태가 정상이 아닐때 기존 위치로 되돌림
    temp_block = { ...move_item };

    // 게임 오버 처리
    if (moveType === 'retry') {
      clearInterval(downInterval);
      showGameOverText();
    }

    // 무한 렌더링 방지용인데 왜 이게 방지를 시키는지 좀 더 이해 필요
    setTimeout(() => {
      // 랜더링에 게임오버용을 보내는데 랜더가 다시 돌면서 두번째에도 갈곳이 없으면 진짜 오버 때리나봄
      rendering('retry');
      if (moveType === 'location_top') {
        seizeBlcok();
      }
    }, 0);
  }
  // });
  move_item.location_left = location_left;
  move_item.location_top = location_top;
}

function checkEmp(target) {
  //타겟이 없거나, 타겟의 클래스중에 seized가 있다면 false
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

//나중에 전체 무빙을 없애는게 아니라 현재 칸만 무빙 없애는걸로 바꿔야함
// 매개변수로 현재 요소받아서 거기만 무빙 빼고 추가하는 뭔가가 필요할듯
function seizeBlcok() {
  const movingBlocks = document.querySelectorAll('.moving');

  movingBlocks.forEach((moveing) => {
    moveing.classList.remove('moving');
    moveing.classList.add('seized');
  });

  // 현제 체킹중인지 아닌지에 따라서 check_match 실행여부 결정\
  // checking = true;면 현재 check_match가 돌아가고 있다는 뜻
  if (!checking) {
    checking = true;
    //블럭들 합치기 체크 상황에 따라 반복시켜야 해서 while에 넣음
    while (check_match()) {}

    checking = false;
  }
}

function sleep(ms) {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
}

function check_match() {
  //각 행들담은 변수
  const childes = start.childNodes;

  //각행별로 다 차있는지를 검사하는데 나는 앞뒤좌우 검사해야함
  for (let i = 0; i < childes.length; i++) {
    // 모든 라인을 돌며
    // 각 라인의 첫번째부터 끝번까지 검사
    for (
      let j = 0;
      j < childes[i].querySelectorAll('li > ul > li').length;
      j++
    ) {
      //현재 위치 = i 행의 j 번째 요소
      let el = childes[i].querySelectorAll('li > ul > li')[j];
      //만약 현재요소의 클래스에 seized가 있으면
      if (el.classList.value.indexOf('seized') > 0) {
        let nowClassList = el.classList;
        let list = [];
        let els = {
          //  상, 좌, 우, 하 순으로 객체 담음
          0: childes[i - 1]
            ? childes[i - 1].querySelectorAll('li > ul > li')[j]
            : null,
          1: childes[i + 1]
            ? childes[i + 1].querySelectorAll('li > ul > li')[j]
            : null,
          2: childes[i].querySelectorAll('li > ul > li')[j - 1],
          3: childes[i].querySelectorAll('li > ul > li')[j + 1],
        };

        // 만약 현재기준 바닥이 존재하는데 클래스명이 없을때
        if (els[1] && els[1].classList.length <= 0) {
          console.log('바닥에 뭐 없어서 내림');
          els[1].classList = el.classList;
          el.classList = '';
          // 바닥으로 내려준 후 검사 다시 시작
          return true;
        }

        for (let n = 0; n < 4; n++) {
          if (els[n] && els[n].classList.value == nowClassList.value) {
            list.push(els[n]);
          }
          if (list.length >= 2) {
            break;
          }
        }

        if (list.length >= 2) {
          for (let li of list) {
            li.classList = '';
          }

          let next = nextClassLevel(nowClassList[0]);

          el.classList = next + ' seized';

          if (!blocks.includes(next)) {
            blocks.push(next);
          }

          console.log('합치기 함');

          score++;
          scoreDisplay.innerText = score;

          return true;
        }
      }
    }
  }
  generateNewBlock();
  return false;
}

function nextClassLevel(className) {
  className = className.trim();

  let newClass = '';
  switch (className) {
    case 'one':
      newClass = 'two';
      break;
    case 'two':
      newClass = 'three';
      break;
    case 'three':
      newClass = 'four';
      break;
    case 'four':
      newClass = 'five';
      break;
    case 'five':
      newClass = 'six';
      break;
    case 'six':
      newClass = 'seven';
      break;
    case 'seven':
      newClass = 'eight';
      break;
    case 'eight':
      newClass = 'nine';
      break;
    case 'nine':
      newClass = 'ten';
      break;
  }

  return newClass;
}

function showGameOverText() {
  gameEnd.style.display = 'block';
}

// 새로운 블럭 만드는 메서드
function generateNewBlock() {
  // 기존의 아래로 내려가던 반복 동작 삭제
  clearInterval(downInterval);

  //새로 아래로 내려가는 동작 시작
  downInterval = setInterval(() => {
    moveBlock('location_top', 1);
  }, speed);

  const randomIndex = Math.floor(Math.random() * (blocks.length - 1));
  //랜덤으로 블럭 타입 세팅 + 아이템의 위치값 재설정
  move_item.type = blocks[randomIndex];
  move_item.location_top = 0;
  move_item.location_left = 3;
  temp_block = { ...move_item };

  // 랜더링 시작
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
