document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소들
    const personForm = document.getElementById('person-form');
    const groupForm = document.getElementById('group-form');
    const timelineForm = document.getElementById('timeline-form');
    const peopleList = document.getElementById('people-list');
    const formContainer = document.getElementById('form-container');
    const groupFormContainer = document.getElementById('group-form-container');
    const detailContainer = document.getElementById('detail-container');
    const showFormBtn = document.getElementById('show-form-btn');
    const showGroupFormBtn = document.getElementById('show-group-form-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const cancelGroupBtn = document.getElementById('cancel-group-btn');
    const closeDetailBtn = document.getElementById('close-detail-btn');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photo-preview');
    const searchInput = document.getElementById('search-input');
    const groupTabs = document.getElementById('group-tabs');
    const personGroupSelect = document.getElementById('person-group');
    const modalTitle = document.querySelector('#form-container h2');
    const tagsInput = document.getElementById('tags');
    const detailInfo = document.getElementById('detail-info');
    const timelineList = document.getElementById('timeline-list');
    const timelineContent = document.getElementById('timeline-content');

    // 로컬 스토리지 데이터 불러오기
    let people = JSON.parse(localStorage.getItem('people')) || [];
    let groups = JSON.parse(localStorage.getItem('groups')) || [];
    let currentGroupId = 'all';
    let editIndex = -1;
    let detailIndex = -1; // 현재 상세 보기 중인 인물의 인덱스

    // 초기화 함수
    function init() {
        renderGroupTabs();
        updateGroupSelect();
        renderPeople();
    }

    // 모달 제어 함수 (인물 추가/수정)
    function togglePersonModal() {
        formContainer.classList.toggle('hidden');
        if (formContainer.classList.contains('hidden')) {
            personForm.reset();
            resetPhotoPreview();
            editIndex = -1;
            modalTitle.textContent = '새로운 인물 추가';
        } else {
            document.getElementById('name').focus();
        }
    }

    // 모달 제어 함수 (그룹 추가)
    function toggleGroupModal() {
        groupFormContainer.classList.toggle('hidden');
        if (!groupFormContainer.classList.contains('hidden')) {
            document.getElementById('group-name').focus();
        } else {
            groupForm.reset();
        }
    }

    // 모달 제어 함수 (상세 보기)
    function toggleDetailModal() {
        detailContainer.classList.toggle('hidden');
        if (detailContainer.classList.contains('hidden')) {
            detailIndex = -1;
        }
    }

    // 사진 프리뷰 리셋
    function resetPhotoPreview() {
        photoPreview.innerHTML = '<span>👤</span>';
    }

    // 그룹 탭 렌더링
    function renderGroupTabs() {
        const tabs = [`<button class="group-tab ${currentGroupId === 'all' ? 'active' : ''}" data-group-id="all">전체보기</button>`];
        groups.forEach(group => {
            tabs.push(`<button class="group-tab ${currentGroupId === group.id ? 'active' : ''}" data-group-id="${group.id}">${group.name}</button>`);
        });
        groupTabs.innerHTML = tabs.join('');
        document.querySelectorAll('.group-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                currentGroupId = tab.dataset.groupId;
                document.querySelectorAll('.group-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderPeople();
            });
        });
    }

    // 인물 추가 폼의 그룹 선택 옵션 업데이트
    function updateGroupSelect() {
        let options = '<option value="">그룹 선택 없음</option>';
        groups.forEach(group => {
            options += `<option value="${group.id}">${group.name}</option>`;
        });
        personGroupSelect.innerHTML = options;
    }

    // 인물 목록 렌더링
    function renderPeople() {
        peopleList.innerHTML = '';
        const keyword = searchInput.value.toLowerCase();
        let filteredPeople = people;

        if (currentGroupId !== 'all') {
            filteredPeople = filteredPeople.filter(p => p.groupId === currentGroupId);
        }

        if (keyword) {
            filteredPeople = filteredPeople.filter(p => {
                const tagStr = p.tags ? p.tags.join(' ') : '';
                const searchStr = (p.name + p.affiliation + p.memo + tagStr).toLowerCase();
                return searchStr.includes(keyword);
            });
        }

        if (filteredPeople.length === 0) {
            peopleList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">등록된 인물이 없거나 결과가 없습니다.</div>`;
            return;
        }

        filteredPeople.forEach((person) => {
            const actualIndex = people.indexOf(person);
            const groupName = groups.find(g => g.id === person.groupId)?.name || '';
            const card = document.createElement('div');
            card.className = 'person-card';
            
            const photoHtml = person.photo 
                ? `<div class="card-img-wrapper" onclick="showDetail(${actualIndex})"><img src="${person.photo}" class="card-img" alt="${person.name}"></div>`
                : `<div class="card-img-wrapper" onclick="showDetail(${actualIndex})"><span style="font-size: 60px;">👤</span></div>`;

            const tagsHtml = person.tags && person.tags.length > 0
                ? `<div class="card-tags">${person.tags.map(t => `<span class="tag">${t.startsWith('#') ? t : '#' + t}</span>`).join('')}</div>`
                : '';

            card.innerHTML = `
                <div class="card-btns">
                    <button class="edit-btn" onclick="editPerson(${actualIndex})">✎</button>
                    <button class="delete-btn" onclick="deletePerson(${actualIndex})">×</button>
                </div>
                ${photoHtml}
                <div class="card-content" onclick="showDetail(${actualIndex})">
                    ${groupName ? `<span class="card-group-tag">${groupName}</span>` : ''}
                    <h3>${person.name}</h3>
                    <p><strong>🗓️ 생일:</strong> ${person.birthday || '미입력'}</p>
                    <p><strong>🏢 소속:</strong> ${person.affiliation || '미입력'}</p>
                    <div class="memo-text">${person.memo || '메모가 없습니다.'}</div>
                    ${tagsHtml}
                </div>
            `;
            peopleList.appendChild(card);
        });
    }

    // 상세 정보 보기 함수
    window.showDetail = (index) => {
        detailIndex = index;
        const person = people[index];
        const groupName = groups.find(g => g.id === person.groupId)?.name || '없음';
        
        detailInfo.innerHTML = `
            ${person.photo ? `<img src="${person.photo}" class="detail-img">` : '<div class="detail-img" style="display:flex;justify-content:center;align-items:center;background:#f0f0f0;"><span style="font-size:50px;">👤</span></div>'}
            <div class="detail-text">
                <h2>${person.name}</h2>
                <p><strong>그룹:</strong> ${groupName}</p>
                <p><strong>생일:</strong> ${person.birthday || '미입력'}</p>
                <p><strong>소속:</strong> ${person.affiliation || '미입력'}</p>
                <p><strong>기본 메모:</strong> ${person.memo || '없음'}</p>
            </div>
        `;

        renderTimeline();
        detailContainer.classList.remove('hidden');
    };

    // 타임라인 렌더링
    function renderTimeline() {
        const person = people[detailIndex];
        const timeline = person.timeline || [];
        
        if (timeline.length === 0) {
            timelineList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">기록된 타임라인이 없습니다.</p>';
            return;
        }

        timelineList.innerHTML = timeline.map(item => `
            <div class="timeline-item">
                <span class="timeline-date">${item.date}</span>
                <div class="timeline-text">${item.content}</div>
            </div>
        `).reverse().join(''); // 최신순 정렬
    }

    // 타임라인 항목 추가
    timelineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = timelineContent.value.trim();
        if (content && detailIndex !== -1) {
            const now = new Date();
            const dateStr = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            if (!people[detailIndex].timeline) {
                people[detailIndex].timeline = [];
            }
            
            people[detailIndex].timeline.push({
                date: dateStr,
                content: content
            });

            localStorage.setItem('people', JSON.stringify(people));
            timelineContent.value = '';
            renderTimeline();
            // 메인 화면 갱신은 필요 없지만 데이터 동기화를 위해
        }
    });

    // 인물 수정 함수
    window.editPerson = (index) => {
        editIndex = index;
        const person = people[index];
        document.getElementById('name').value = person.name;
        document.getElementById('birthday').value = person.birthday || '';
        document.getElementById('affiliation').value = person.affiliation || '';
        document.getElementById('person-group').value = person.groupId || '';
        document.getElementById('memo').value = person.memo || '';
        tagsInput.value = person.tags ? person.tags.join(' ') : '';
        if (person.photo) {
            photoPreview.innerHTML = `<img src="${person.photo}" alt="Preview">`;
        } else {
            resetPhotoPreview();
        }
        modalTitle.textContent = '인물 정보 수정';
        formContainer.classList.remove('hidden');
    };

    // 이벤트 리스너들
    showFormBtn.addEventListener('click', togglePersonModal);
    showGroupFormBtn.addEventListener('click', toggleGroupModal);
    cancelBtn.addEventListener('click', togglePersonModal);
    cancelGroupBtn.addEventListener('click', toggleGroupModal);
    closeDetailBtn.addEventListener('click', toggleDetailModal);
    
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            reader.readAsDataURL(file);
        }
    });

    searchInput.addEventListener('input', () => renderPeople());

    groupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('group-name').value.trim();
        if (name) {
            groups.push({ id: 'group_' + Date.now(), name: name });
            localStorage.setItem('groups', JSON.stringify(groups));
            renderGroupTabs();
            updateGroupSelect();
            toggleGroupModal();
        }
    });

    personForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const photoFile = photoInput.files[0];
        let photoDataUrl = '';
        if (photoFile) {
            photoDataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(photoFile);
            });
        } else if (editIndex !== -1) {
            photoDataUrl = people[editIndex].photo || '';
        }
        const tagsValue = tagsInput.value.trim();
        const tagsArray = tagsValue ? tagsValue.split(/\s+/).filter(t => t !== '') : [];
        const personData = {
            name: document.getElementById('name').value,
            birthday: document.getElementById('birthday').value,
            affiliation: document.getElementById('affiliation').value,
            memo: document.getElementById('memo').value,
            groupId: personGroupSelect.value,
            photo: photoDataUrl,
            tags: tagsArray,
            timeline: editIndex !== -1 ? (people[editIndex].timeline || []) : []
        };
        if (editIndex === -1) people.push(personData);
        else people[editIndex] = personData;
        localStorage.setItem('people', JSON.stringify(people));
        renderPeople();
        togglePersonModal();
    });

    window.deletePerson = (index) => {
        if (confirm('이 정보를 삭제하시겠습니까?')) {
            people.splice(index, 1);
            localStorage.setItem('people', JSON.stringify(people));
            renderPeople();
        }
    };

    init();
});
