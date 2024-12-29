"use client";

import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const Card = ({ children }: { children: ReactNode }) => (
  <div className="space-y-8 bg-white/30 p-4 rounded-lg">{children}</div>
);

const Grid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-2 gap-4">{children}</div>
);

const Side = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn("flex flex-col gap-2", className)}>{children}</div>;

export default function Roller() {
  const [attackers, setAttackers] = useState<number | null>(null);
  const [defenders, setDefenders] = useState<number | null>(null);
  const [output, setOutput] = useState<number[]>([]);
  const [rolls, setRolls] = useState<
    {
      attack: number[];
      defend: number[];
      remaining: number[];
    }[]
  >([]);

  const roll = (a: number, d: number, r: typeof rolls) => {
    const numberOfAttackDice = Math.min(a - 1, 3);
    const numberOfDefendDice = Math.min(d, 2);

    const attackDice = Array.from(
      { length: numberOfAttackDice },
      () => Math.floor(Math.random() * 6) + 1
    ).sort((a, b) => b - a);
    const defendDice = Array.from(
      { length: numberOfDefendDice },
      () => Math.floor(Math.random() * 6) + 1
    ).sort((a, b) => b - a);

    let attackLosses = 0;
    let defendLosses = 0;

    defendDice.forEach((defendRoll, i) => {
      if (attackDice[i] > defendRoll) defendLosses++;
      else if (attackDice[i]) attackLosses++;
    });

    const remaining = [a - attackLosses, d - defendLosses];
    r.push({ attack: attackDice, defend: defendDice, remaining });

    return remaining;
  };

  const blitz = () => {
    if (!attackers || !defenders) return;

    const r = [] as typeof rolls;
    let o = roll(attackers, defenders, r);
    while (o[0] > 1 && o[1] > 0) {
      o = roll(o[0], o[1], r);
    }

    setAttackers(o[0]);
    setDefenders(o[1]);
    setOutput(o);
    setRolls(r);
  };

  const canAttack = (attackers ?? 0) > 1 && (defenders ?? 0) > 0;

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (output.length > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [output]);

  return (
    <div className="space-y-8">
      <Card>
        <Grid>
          <Side className="items-start">
            <h3>Attacker</h3>
            <Input
              type="number"
              value={attackers !== null ? attackers : ""}
              onChange={(e) => setAttackers(Number(e.target.value) ?? null)}
            />
          </Side>
          <Side className="items-end">
            <h3>Defender</h3>
            <Input
              type="number"
              className="text-right"
              value={defenders !== null ? defenders : ""}
              onChange={(e) => setDefenders(Number(e.target.value) ?? null)}
            />
          </Side>
        </Grid>
        <Grid>
          <Button
            variant="outline"
            disabled={!canAttack}
            onClick={() => {
              if (!attackers || !defenders) return;

              const r = [] as typeof rolls;
              const o = roll(attackers, defenders, r);
              setAttackers(o[0]);
              setDefenders(o[1]);
              setOutput(o);
              setRolls(r);
            }}
          >
            Roll
          </Button>
          <Button disabled={!canAttack} onClick={() => blitz()}>
            Blitz
          </Button>
        </Grid>
      </Card>
      <div
        className={cn("space-y-4 transition-transform duration-300", {
          "opacity-0": output.length == 0,
          "scale-105": animate,
        })}
      >
        {output[0] != 0 && output[1] != 0 ? (
          <>
            <h2 className="text-center">Remaining Forces</h2>
            <Card>
              <Grid>
                <Side className="items-start">
                  <h3>Attacker</h3>
                  <p>{output[0]}</p>
                </Side>
                <Side className="items-end">
                  <h3>Defender</h3>
                  <p>{output[1]}</p>
                </Side>
              </Grid>
            </Card>
          </>
        ) : (
          <>
            <h2 className="text-center">Winner</h2>
            <Card>
              <div className="flex justify-between items-center">
                <h3>{output[0] == 0 ? "Defender" : "Attacker"}</h3>
                <p>{output[0] == 0 ? defenders : attackers}</p>
              </div>
            </Card>
          </>
        )}
      </div>
      <div
        className={cn("space-y-4", {
          "opacity-0": rolls.length == 0,
        })}
      >
        <Card>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                View Individual Roll Breakdown
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {rolls.map((roll, i) => (
                    <div
                      key={i}
                      className={cn("space-y-2", {
                        "border-t pt-2": i !== 0,
                      })}
                    >
                      <Grid>
                        <Side className="items-start">
                          <h3>Attacker</h3>
                          <p>
                            {roll.attack.map((rollValue, i) => (
                              <span
                                key={i}
                                className={cn("", {
                                  "text-red-500": roll.defend[i] >= rollValue,
                                  "text-green-500": roll.defend[i] < rollValue,
                                })}
                              >
                                {i === 0 ? rollValue : `, ${rollValue}`}
                              </span>
                            ))}
                          </p>
                        </Side>
                        <Side className="items-end">
                          <h3>Defender</h3>
                          <p>
                            {roll.defend.map((rollValue, i) => (
                              <span
                                key={i}
                                className={cn("", {
                                  "text-red-500": roll.attack[i] > rollValue,
                                  "text-green-500": roll.attack[i] <= rollValue,
                                })}
                              >
                                {i === 0 ? rollValue : `, ${rollValue}`}
                              </span>
                            ))}
                          </p>
                        </Side>
                      </Grid>
                      <h3>Remaining</h3>
                      <Grid>
                        <Side className="items-start">
                          <p>{roll.remaining[0]}</p>
                        </Side>
                        <Side className="items-end">
                          <p>{roll.remaining[1]}</p>
                        </Side>
                      </Grid>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
      {rolls.length !== 0 && output.length !== 0 ? (
        <div className="flex justify-center pb-10">
          <Button
            variant="ghost"
            onClick={() => {
              setAttackers(null);
              setDefenders(null);
              setOutput([]);
              setRolls([]);
            }}
          >
            Reset
          </Button>
        </div>
      ) : null}
    </div>
  );
}
