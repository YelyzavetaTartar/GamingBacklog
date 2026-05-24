using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GamingBacklog.Models;
using BCrypt.Net;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly GamingBacklogContext _context;
    public AuthController(GamingBacklogContext context)
    {
        _context = context;
    }

    // GET: api/User
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUser()
    {
        return await _context.Users.ToListAsync();
    }

    // GET: api/User/5
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }

    // PUT: api/User/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUser(int? id, User user)
    {
        if (id != user.Id)
        {
            return BadRequest();
        }

        _context.Entry(user).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // POST: api/Auth/register
    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(User user)
    {
        // Перевірка, чи не зайнятий Email
        if (await _context.Users.AnyAsync(u => u.Email == user.Email))
        {
            return BadRequest("Користувач з такою поштою вже існує");
        }
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { userId = user.Id, username = user.Username });
    }

    // POST: api/Auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] User loginData)
    {
        if (string.IsNullOrEmpty(loginData.Email) || string.IsNullOrEmpty(loginData.PasswordHash))
        {
            return BadRequest("Введіть логін та пароль");
        }

        // Шукаємо користувача за поштою
        var user = await _context.Users
           .FirstOrDefaultAsync(u => u.Email == loginData.Email);

        if (user == null|| !BCrypt.Net.BCrypt.Verify(loginData.PasswordHash, user.PasswordHash))
        {
            return Unauthorized("Невірний логін або пароль");
        }

        // Повертаємо ID та ім'я для збереження в браузері
        return Ok(new { userId = user.Id, username = user.Username });
    }

    private bool UserExists(int id)
    {
        return _context.Users.Any(e => e.Id == id);
    }

// DELETE: api/User/5
[HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int? id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool UserExists(int? id)
    {
        return _context.Users.Any(e => e.Id == id);
    }
}
