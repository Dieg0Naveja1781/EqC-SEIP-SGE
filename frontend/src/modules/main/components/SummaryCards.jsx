const cards = [
  { title: 'Expedientes', value: 12 },
  { title: 'Pendientes', value: 3 },
  { title: 'Mensajes', value: 7 },
];

function SummaryCards() {
  return (
    <section className="card-grid">
      {cards.map((card) => (
        <article className="summary-card" key={card.title}>
          <p>{card.title}</p>
          <strong>{card.value}</strong>
        </article>
      ))}
    </section>
  );
}

export default SummaryCards;
