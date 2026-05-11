using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GamingBacklog.Models;

namespace GamingBacklog.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserBacklogsController : ControllerBase
    {
        private readonly GamingBacklogContext _context;

        public UserBacklogsController(GamingBacklogContext context)
        {
            _context = context;
        }

        // GET: api/UserBacklogs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserBacklog>>> GetUserBacklogs()
        {
            return await _context.UserBacklogs
                .Include(u => u.Game)
                .Include(u => u.Platform)
                .Include(u => u.Genre) 
                .Include(u => u.Status) 
                .Include(u => u.User)
                .ToListAsync();
        }

        // GET: api/UserBacklogs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserBacklog>> GetUserBacklog(int id)
        {
            var userBacklog = await _context.UserBacklogs
                .Include(u => u.Game)
                .Include(u => u.Platform)
                .Include(u => u.Genre)
                .Include(u => u.Status)
                .Include(u => u.User)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (userBacklog == null)
            {
                return NotFound();
            }

            return userBacklog;
        }

        //Метод, якмй реалізує доступ Користувача до свого особистого списку
        // GET: api/UserBacklogs/user/1
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<UserBacklog>>> GetUserSpecificBacklog(int userId)
        {
            var userBacklog = await _context.UserBacklogs
                .Include(u => u.Game)
                .Include(u => u.Status)
                .Include(u => u.Platform)
                .Include(u => u.Genre)
                .Where(b => b.UserId == userId)
                .ToListAsync();
            if (userBacklog == null || !userBacklog.Any())
            {
                return NotFound("У цього користувача поки немає ігор у списку.");
            }

            return userBacklog;
        }

        // Метод фільтрації
        // GET: api/UserBacklogs/filter?platformId=1&genreId=2&statusId=3&minInterest=4
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<UserBacklog>>> GetFilteredBacklog(
            [FromQuery] string? title,
            [FromQuery] int? platformId,
            [FromQuery] int? genreId,
            [FromQuery] int? statusId,
            [FromQuery] int? interestLevel)
        {
                var query = _context.UserBacklogs
                .Include(u => u.Game)
                .Include(u => u.Platform)
                .Include(u => u.Genre)
                .Include(u => u.Status)
                .AsQueryable();

            if (!string.IsNullOrEmpty(title))
            {
                query = query.Where(b => b.Game.Title.Contains(title));
            }

            if (platformId.HasValue)
            {
                query = query.Where(b => b.PlatformId == platformId.Value);
            }

            if (genreId.HasValue)
            {
                query = query.Where(b => b.GenreId == genreId.Value);
            }

            if (statusId.HasValue)
            {
                query = query.Where(b => b.StatusId == statusId.Value);
            }

            if (interestLevel.HasValue)
            {
                query = query.Where(b => b.InterestLevel == interestLevel.Value);
            }

            return await query.ToListAsync();
        }

        // PUT: api/UserBacklogs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUserBacklog(int id, UserBacklog userBacklog)
        {
            if (id != userBacklog.Id)
            {
                return BadRequest();
            }

            _context.Entry(userBacklog).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserBacklogExists(id))
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

        // Метод для прецеденту «Оцінити гру»
        // PATCH: api/UserBacklogs/5/rate?score=9
        [HttpPatch("{id}/rate")]
        public async Task<IActionResult> RateGame(int id, [FromQuery] int score)
        {
            var entry = await _context.UserBacklogs.FindAsync(id);
            if (entry == null) return NotFound();

            if (score < 1 || score > 10) return BadRequest("Оцінка має бути від 1 до 10.");

            entry.FinalScore = score; 
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Метод для прецеденту «Оновити статус проходження»
        // PATCH: api/UserBacklogs/5/status?statusId=3
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] int statusId)
        {
            var entry = await _context.UserBacklogs.FindAsync(id);
            if (entry == null) return NotFound();

            // Перевірка чи такий статус взагалі існує в базі
            var statusExists = await _context.Statuses.AnyAsync(s => s.Id == statusId);
            if (!statusExists) return BadRequest("Такого статусу не існує.");

            entry.StatusId = statusId;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/UserBacklogs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<UserBacklog>> PostUserBacklog(UserBacklog userBacklog)
        {
            _context.UserBacklogs.Add(userBacklog);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUserBacklog", new { id = userBacklog.Id }, userBacklog);
        }

        // DELETE: api/UserBacklogs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserBacklog(int id)
        {
            var userBacklog = await _context.UserBacklogs.FindAsync(id);
            if (userBacklog == null)
            {
                return NotFound();
            }

            _context.UserBacklogs.Remove(userBacklog);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserBacklogExists(int id)
        {
            return _context.UserBacklogs.Any(e => e.Id == id);
        }
    }
}
