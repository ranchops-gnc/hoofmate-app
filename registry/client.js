const form = document.querySelector('#animal-form');
const submit = form.querySelector('button');
const status = document.querySelector('#status');
const filter = document.querySelector('#filter');
const list = document.querySelector('#animals');
const empty = document.querySelector('#empty');
let animals = [];

const label = (species) => species[0].toUpperCase() + species.slice(1);

function render() {
  const visible = animals.filter((animal) => !filter.value || animal.species === filter.value);
  list.replaceChildren(...visible.map((animal) => {
    const row = document.createElement('li');
    row.textContent = [animal.name || animal.identification, label(animal.species),
      animal.name && animal.identification, animal.breed].filter(Boolean).join(' · ');
    return row;
  }));
  empty.hidden = visible.length !== 0;
}

async function load() {
  const response = await fetch('/api/animals');
  if (!response.ok) throw new Error('Could not load the registry. Reload the page to try again.');
  return response.json();
}

filter.addEventListener('change', render);
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submit.disabled = true;
  status.textContent = '';
  try {
    const response = await fetch('/api/animals', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    form.reset();
    filter.value = result.species;
    status.textContent = 'Animal added.';
    animals = [...animals, result];
    render();
  } catch (error) {
    status.textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});

try {
  const registry = await load();
  for (const species of registry.species) {
    form.elements.species.add(new Option(label(species), species));
    filter.add(new Option(label(species), species));
  }
  animals = registry.animals;
  render();
  status.textContent = 'Enter a name or tag ID.';
  submit.disabled = false;
} catch (error) {
  status.textContent = error.message;
}
