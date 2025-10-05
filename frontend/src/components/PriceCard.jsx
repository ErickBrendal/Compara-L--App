export default function PriceCard({ data }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{data.product}</h3>
        <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
          {data.supplier}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-4">{data.description}</p>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">Preço</p>
          <p className="text-3xl font-bold text-green-400">
            R$ {data.price.toFixed(2)}
          </p>
        </div>

        {data.oldPrice && (
          <div className="text-right">
            <p className="text-gray-400 text-sm line-through">
              R$ {data.oldPrice.toFixed(2)}
            </p>
            <p className="text-red-400 text-sm font-semibold">
              -{((1 - data.price / data.oldPrice) * 100).toFixed(0)}%
            </p>
          </div>
        )}
      </div>

      {data.stock && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            Estoque: <span className="text-white">{data.stock} unidades</span>
          </p>
        </div>
      )}
    </div>
  );
}
