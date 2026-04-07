use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maquinas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->string('nome');
            $table->string('tipo')->nullable();
            $table->string('localizacao')->nullable();
            $table->integer('capacidade')->nullable();
            $table->enum('status', ['disponivel', 'em_producao', 'manutencao', 'parada'])->default('disponivel');
            $table->string('sankhya_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maquinas');
    }
};